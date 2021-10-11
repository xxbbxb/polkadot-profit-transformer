import { AccountId32, Address } from '@polkadot/types/interfaces'
import { TipsModel } from './models/tips.model'
import { DemocracyProposalModel, DemocracyReferendaModel } from './models/democracy.model'
import { TechnicalCommiteeProposalModel } from './models/technicalCommittee.model'

import { Knex } from 'knex'
import { Logger } from '../logger/logger'
import { PreimageModel } from './models/preimage.model'
import { TreasuryProposalModel } from './models/treasuryProposal.model'
import { u32 } from '@polkadot/types'
import { CouncilProposalModel } from './models/councilMotions.model'

export type GovernanceRepository = ReturnType<typeof GovernanceRepository>

export const GovernanceRepository = (deps: { knex: Knex; logger: Logger }) => {
  const { knex, logger } = deps
  return {
    technicalCommittee: {
      save: async (proposal: TechnicalCommiteeProposalModel): Promise<void> => {
        console.log('GovernanceRepository: proposal to save', proposal)
        const encodedProposal = { ...proposal, data: JSON.stringify(proposal.data) }
        await TechnicalCommiteeProposalModel(knex)
          .insert(encodedProposal)
          .onConflict(['hash', 'extrinsic_id', 'event_id'])
          .merge()
      },
      // findProposalByHash: async (hash: string): Promise<TechnicalCommiteeProposalModel | undefined> => {
      //   const proposal = await TechnicalCommiteeProposalModel(knex).withSchema('dot_polka').where({ hash }).first()
      //   return proposal
      // },
    },
    democracy: {
      referenda: {
        save: async (referenda: DemocracyReferendaModel): Promise<void> => {
          await DemocracyReferendaModel(knex).insert(referenda).onConflict(['id', 'event_id', 'extrinsic_id']).merge()
        },
        findVote: async (
          ReferendumIndex: u32,
          voter: Address | AccountId32 | string,
        ): Promise<DemocracyReferendaModel | undefined> => {
          const voteRecord = await DemocracyReferendaModel(knex)
            .where({ id: ReferendumIndex.toNumber(), event: 'Voted' })
            .whereRaw('cast(data->>? as text) = ?', ['voter', voter.toString()])
            .first()
          if (!voteRecord) return undefined
          return voteRecord
        },
        removeVote: async (vote: DemocracyReferendaModel): Promise<void> => {
          await DemocracyReferendaModel(knex).where(vote).del()
        },
      },
      proposal: {
        save: async (proposal: DemocracyProposalModel): Promise<void> => {
          await DemocracyProposalModel(knex).insert(proposal).onConflict(['id', 'event_id', 'extrinsic_id']).merge()
        },
      },
    },
    council: {
      save: async (proposal: CouncilProposalModel): Promise<void> => {
        await CouncilProposalModel(knex).insert(proposal).onConflict(['id', 'event_id', 'extrinsic_id']).merge()
      },
      findProposalIdByHash: async (hash: string): Promise<number> => {
        const proposal = await CouncilProposalModel(knex).where({ hash }).first()
        if (!proposal) throw new Error('Can not find council proposal by hash: ' + hash)
        return Number(proposal.id)
      },
    },
    preimages: {
      save: async (preimage: PreimageModel): Promise<void> => {
        logger.info({ preimage }, 'save preimage in db')
        await PreimageModel(knex).insert(preimage).onConflict(['proposal_hash', 'block_id', 'event_id']).merge()
      },
    },
    treasury: {
      proposal: {
        save: async (proposal: TreasuryProposalModel): Promise<void> => {
          await TreasuryProposalModel(knex).insert(proposal).onConflict(['id', 'event_id', 'extrinsic_id']).merge()
        },
      },
    },
    tips: {
      save: async (proposal: TipsModel): Promise<void> => {
        await TipsModel(knex).insert(proposal).onConflict(['hash', 'event_id', 'extrinsic_id']).merge()
      },
    },
  }
}
