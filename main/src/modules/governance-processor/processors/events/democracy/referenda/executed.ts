import { Logger } from 'loaders/logger'
import { GovernanceRepository } from 'apps/common/infra/postgresql/governance.repository'
import { DemocracyReferendaModel } from '@/models/democracy.model'
import { EventModel } from '@/models/event.model'

export const processDemocracyReferendaExecuted = async (
  event: EventModel,
  governanceRepository: GovernanceRepository,
  logger: Logger,
): Promise<void> => {
  logger.trace({ event }, 'process democracy referenda executed event')
  const eventData = event.event.data

  const referendumIndex = parseInt(eventData[0], 16)
  const result = eventData[1] ? 'Success' : 'Fail'

  const democracyReferenda: DemocracyReferendaModel = {
    id: referendumIndex,
    block_id: event.block_id,
    event_id: event.id,
    extrinsic_id: '',
    event: 'Executed',
    data: { result },
  }

  await governanceRepository.democracy.referenda.save(democracyReferenda)
}
