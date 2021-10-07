import { Logger } from 'apps/common/infra/logger/logger'
import { GovernanceRepository } from 'apps/common/infra/postgresql/governance.repository'
import { EventModel } from 'apps/common/infra/postgresql/models/event.model'
import { TechnicalCommiteeProposalModel } from 'apps/common/infra/postgresql/models/technicalCommittee.model'

export const processTechnicalCommitteeClosedEvent = async (
  event: EventModel,
  governanceRepository: GovernanceRepository,
  logger: Logger,
): Promise<void> => {
  logger.trace({ event }, 'process technical commitee closed event')

  const eventData = JSON.parse(event.data)
  const hash = eventData[0]['Hash']

  // const techCommProposal = await governanceRepository.technicalCommittee.findProposalByHash(hash)
  // if (!techCommProposal) throw Error('no tech com proposal found for tech comm closed event ' + event.event_id)

  const ayeVotesCount = parseInt(eventData[1]['MemberCount'], 16)
  const nayVotesCount = parseInt(eventData[2]['MemberCount'], 16)

  const proposal: TechnicalCommiteeProposalModel = {
    hash,
    id: null, // todo techCommProposal.id,
    block_id: event.block_id,
    extrinsic_id: '',
    event_id: event.id,
    event: 'Closed',
    data: { ayeVotesCount, nayVotesCount },
  }

  await governanceRepository.technicalCommittee.save(proposal)
}
