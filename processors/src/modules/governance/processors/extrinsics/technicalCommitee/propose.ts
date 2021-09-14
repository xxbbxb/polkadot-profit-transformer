import { findExtrinic } from '../../utils/findExtrinsic'
import { ApiPromise } from '@polkadot/api'
import { TechnicalCommiteeProposalModel } from '../../../../../apps/common/infra/postgresql/governance/models/technicalCommiteeModels'
import { Extrinsic } from './../../../types'
import { GovernanceRepository } from './../../../../../apps/common/infra/postgresql/governance/governance.repository'
import { Logger } from 'apps/common/infra/logger/logger'
import { isExtrinsicSuccess } from '../../utils/isExtrinsicSuccess'
import { findEvent } from '../../utils/findEvent'
import { AccountId, Hash, MemberCount, Proposal, ProposalIndex } from '@polkadot/types/interfaces'

export const processTechnicalCommiteeProposeExtrinsic = async (
  extrinsic: Extrinsic,
  governanceRepository: GovernanceRepository,
  logger: Logger,
  polkadotApi: ApiPromise,
): Promise<void> => {
  logger.info({ extrinsic }, 'processTechnicalCommiteeProposeExtrinsic')

  const blockHash = await polkadotApi.rpc.chain.getBlockHash(extrinsic.block_id)
  const blockEvents = await polkadotApi.query.system.events.at(blockHash)

  const isExtrinsicSuccessfull = await isExtrinsicSuccess(extrinsic, blockEvents, polkadotApi)
  if (!isExtrinsicSuccessfull) return

  const block = await polkadotApi.rpc.chain.getBlock(blockHash)

  const extrinsicFull = await findExtrinic(block, 'technicalCommittee', 'propose', polkadotApi)
  if (!extrinsicFull) throw Error('no full extrinsic for enrty ' + extrinsic.id)

  const techCommProposedEvent = findEvent(blockEvents, 'technicalCommittee', 'Proposed')
  if (!techCommProposedEvent) throw Error('no technicalcommittee Proposed event for enrty ' + extrinsic.id)

  const proposer = <AccountId>techCommProposedEvent.event.data[0]
  const proposalIndex = <ProposalIndex>techCommProposedEvent.event.data[1]
  const proposalHash = <Hash>techCommProposedEvent.event.data[2]
  const threshold = <MemberCount>techCommProposedEvent.event.data[3]
  const proposal = <Proposal>extrinsicFull.args[1]

  const proposalModel: TechnicalCommiteeProposalModel = {
    id: proposalIndex.toNumber(),
    hash: proposalHash.toString(),
    block_id: extrinsic.block_id,
    event: 'Proposed',
    data: {
      proposer,
      threshold: parseInt(threshold.toHex(), 16),
      proposal: proposal,
    },
    extrinsic_id: extrinsic.id,
    event_id: 'propose',
  }

  console.log({ proposalModel })

  await governanceRepository.technicalCommittee.save(proposalModel)
}
