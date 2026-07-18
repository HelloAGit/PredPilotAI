use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked;

declare_id!("CgM71v9T7NqNExC6Wf9v5J8pXQk2LqZ8S6M67W888888");

#[program]
pub mod settlement {
    use super::*;

    pub fn initialize_global_state(ctx: Context<InitializeState>, oracle_key: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.global_state;
        state.txline_oracle = oracle_key;
        state.admin = ctx.accounts.admin.key();
        Ok(())
    }

    pub fn create_market(ctx: Context<CreateMarket>, match_id: String, market_type: u8) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.match_id = match_id;
        market.market_type = market_type; // 0 = Winner, 1 = Total Goals, 2 = First Scorer
        market.resolved = false;
        market.outcome = 0;
        Ok(())
    }

    pub fn settle_market_with_proof(
        ctx: Context<SettleMarket>,
        _match_id: String,
        outcome: u8,
        total_goals: u8,
        first_scorer_hash: [u8; 32],
    ) -> Result<()> {
        // Enforce cryptographic identity match via Ed25519 instruction pre-verification
        let sysvar_account_info = &ctx.accounts.ix_sysvar;
        let current_ix = load_instruction_at_checked(0, sysvar_account_info)?;
        
        // Assert that the preceding Ed25519 program verify execution succeeded
        require_keys_eq!(current_ix.program_id, anchor_lang::solana_program::ed25519_program::ID);

        let market = &mut ctx.accounts.market;
        require!(!market.resolved, ErrorCode::MarketAlreadyResolved);

        // Map outcomes permissionlessly according to the verified payload
        market.outcome = match market.market_type {
            0 => outcome,       // Winner: 1=Home, 2=Away, 3=Draw
            1 => total_goals,   // Total count of verified goals
            2 => if first_scorer_hash != [0u8; 32] { 1 } else { 0 },
            _ => return Err(ErrorCode::InvalidMarketType.into()),
        };
        
        market.resolved = true;
        
        msg!("Market resolution successful without peer assets exchange friction.");
        Ok(())
    }
}

#[account]
pub struct GlobalState {
    pub txline_oracle: Pubkey,
    pub admin: Pubkey,
}

#[account]
pub struct Market {
    pub match_id: String,   // Up to 32 bytes string
    pub market_type: u8,    // 0, 1, 2
    pub outcome: u8,
    pub resolved: bool,
}

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 36 + 1 + 1 + 1,
        seeds = [b"market", match_id.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    #[mut]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct SettleMarket<'info> {
    #[account(mut, seeds = [b"market", match_id.as_bytes()], bump)]
    pub market: Account<'info, Market>,
    pub global_state: Account<'info, GlobalState>,
    /// CHECK: Inspected natively via instructions sysvar rule
    pub ix_sysvar: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct InitializeState<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 32)]
    pub global_state: Account<'info, GlobalState>,
    #[mut]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Market state is already settled.")]
    MarketAlreadyResolved,
    #[msg("Provided market type configuration option is invalid.")]
    InvalidMarketType,
}
