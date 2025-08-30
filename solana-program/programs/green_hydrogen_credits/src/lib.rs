use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("8wPYeNWCLCaScHebGkozZKsaaAhoGWQwZKRGufozoXgn");

#[program]
pub mod green_hydrogen_credits {
    use super::*;

    pub fn initialize_credit_mint(
        ctx: Context<InitializeCreditMint>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let credit_mint = &mut ctx.accounts.credit_mint;
        credit_mint.name = name;
        credit_mint.symbol = symbol;
        credit_mint.uri = uri;
        credit_mint.authority = ctx.accounts.authority.key();
        credit_mint.bump = *ctx.bumps.get("credit_mint").unwrap();
        Ok(())
    }

    pub fn issue_credits(
        ctx: Context<IssueCredits>,
        amount: u64,
        renewable_source: String,
        production_date: String,
        facility_id: String,
    ) -> Result<()> {
        let credit = &mut ctx.accounts.credit;
        credit.amount = amount;
        credit.renewable_source = renewable_source;
        credit.production_date = production_date;
        credit.facility_id = facility_id;
        credit.producer = ctx.accounts.producer.key();
        credit.owner = ctx.accounts.producer.key();
        credit.is_validated = false;
        credit.is_retired = false;
        credit.created_at = Clock::get()?.unix_timestamp;
        credit.bump = *ctx.bumps.get("credit").unwrap();

        // Mint tokens to producer
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.producer_token_account.to_account_info(),
                to: ctx.accounts.credit_token_account.to_account_info(),
                authority: ctx.accounts.producer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, amount)?;

        emit!(CreditIssued {
            credit: credit.key(),
            producer: credit.producer,
            amount,
            renewable_source: credit.renewable_source.clone(),
        });

        Ok(())
    }

    pub fn validate_credits(
        ctx: Context<ValidateCredits>,
        validator_id: String,
    ) -> Result<()> {
        let credit = &mut ctx.accounts.credit;
        credit.is_validated = true;
        credit.validator = Some(validator_id);
        credit.validated_at = Some(Clock::get()?.unix_timestamp);

        emit!(CreditValidated {
            credit: credit.key(),
            validator: credit.validator.clone().unwrap(),
            validated_at: credit.validated_at.unwrap(),
        });

        Ok(())
    }

    pub fn transfer_credits(
        ctx: Context<TransferCredits>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let credit = &mut ctx.accounts.credit;
        
        require!(
            credit.is_validated,
            GreenHydrogenCreditsError::CreditNotValidated
        );
        
        require!(
            !credit.is_retired,
            GreenHydrogenCreditsError::CreditAlreadyRetired
        );

        credit.owner = new_owner;
        credit.transferred_at = Some(Clock::get()?.unix_timestamp);

        emit!(CreditTransferred {
            credit: credit.key(),
            from: ctx.accounts.owner.key(),
            to: new_owner,
            transferred_at: credit.transferred_at.unwrap(),
        });

        Ok(())
    }

    pub fn retire_credits(ctx: Context<RetireCredits>) -> Result<()> {
        let credit = &mut ctx.accounts.credit;
        
        require!(
            credit.is_validated,
            GreenHydrogenCreditsError::CreditNotValidated
        );
        
        require!(
            !credit.is_retired,
            GreenHydrogenCreditsError::CreditAlreadyRetired
        );

        credit.is_retired = true;
        credit.retired_at = Some(Clock::get()?.unix_timestamp);

        // Burn tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.credit_token_account.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, credit.amount)?;

        emit!(CreditRetired {
            credit: credit.key(),
            owner: credit.owner,
            retired_at: credit.retired_at.unwrap(),
        });

        Ok(())
    }

    pub fn certify_facility(
        ctx: Context<CertifyFacility>,
        name: String,
        location: String,
        renewable_source: String,
        capacity: u64,
    ) -> Result<()> {
        let facility = &mut ctx.accounts.facility;
        facility.name = name;
        facility.location = location;
        facility.renewable_source = renewable_source;
        facility.capacity = capacity;
        facility.producer = ctx.accounts.producer.key();
        facility.is_certified = true;
        facility.certified_at = Clock::get()?.unix_timestamp;
        facility.bump = *ctx.bumps.get("facility").unwrap();

        emit!(FacilityCertified {
            facility: facility.key(),
            producer: facility.producer,
            renewable_source: facility.renewable_source.clone(),
            capacity: facility.capacity,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCreditMint<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 4 + 50 + 4 + 10 + 4 + 200 + 32 + 1
    )]
    pub credit_mint: Account<'info, CreditMint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct IssueCredits<'info> {
    #[account(
        init,
        payer = producer,
        space = 8 + 8 + 4 + 50 + 4 + 20 + 4 + 50 + 32 + 32 + 1 + 1 + 8 + 8 + 1
    )]
    pub credit: Account<'info, Credit>,
    #[account(mut)]
    pub producer: Signer<'info>,
    #[account(mut)]
    pub producer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub credit_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateCredits<'info> {
    #[account(mut)]
    pub credit: Account<'info, Credit>,
    pub validator: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferCredits<'info> {
    #[account(mut)]
    pub credit: Account<'info, Credit>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RetireCredits<'info> {
    #[account(mut)]
    pub credit: Account<'info, Credit>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub credit_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CertifyFacility<'info> {
    #[account(
        init,
        payer = producer,
        space = 8 + 4 + 50 + 4 + 50 + 4 + 50 + 8 + 32 + 1 + 8 + 1
    )]
    pub facility: Account<'info, Facility>,
    #[account(mut)]
    pub producer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CreditMint {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct Credit {
    pub amount: u64,
    pub renewable_source: String,
    pub production_date: String,
    pub facility_id: String,
    pub producer: Pubkey,
    pub owner: Pubkey,
    pub is_validated: bool,
    pub validator: Option<String>,
    pub validated_at: Option<i64>,
    pub is_retired: bool,
    pub retired_at: Option<i64>,
    pub created_at: i64,
    pub transferred_at: Option<i64>,
    pub bump: u8,
}

#[account]
pub struct Facility {
    pub name: String,
    pub location: String,
    pub renewable_source: String,
    pub capacity: u64,
    pub producer: Pubkey,
    pub is_certified: bool,
    pub certified_at: i64,
    pub bump: u8,
}

#[event]
pub struct CreditIssued {
    pub credit: Pubkey,
    pub producer: Pubkey,
    pub amount: u64,
    pub renewable_source: String,
}

#[event]
pub struct CreditValidated {
    pub credit: Pubkey,
    pub validator: String,
    pub validated_at: i64,
}

#[event]
pub struct CreditTransferred {
    pub credit: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub transferred_at: i64,
}

#[event]
pub struct CreditRetired {
    pub credit: Pubkey,
    pub owner: Pubkey,
    pub retired_at: i64,
}

#[event]
pub struct FacilityCertified {
    pub facility: Pubkey,
    pub producer: Pubkey,
    pub renewable_source: String,
    pub capacity: u64,
}

#[error_code]
pub enum GreenHydrogenCreditsError {
    #[msg("Credit must be validated before transfer")]
    CreditNotValidated,
    #[msg("Credit is already retired")]
    CreditAlreadyRetired,
}
