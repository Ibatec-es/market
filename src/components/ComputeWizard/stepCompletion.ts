import { FormComputeData } from './_types'

type ComputeResourceValues = Pick<
  FormComputeData,
  | 'cpu'
  | 'ram'
  | 'disk'
  | 'gpu'
  | 'jobDuration'
  | 'queueWaitingEnabled'
  | 'queueMaxWaitTime'
>

export function isComputeEnvironmentConfigured(
  values: ComputeResourceValues
): boolean {
  const queueWaitTimeValid =
    !values.queueWaitingEnabled || Number(values.queueMaxWaitTime) > 0

  return (
    Number(values.cpu) > 0 &&
    Number(values.ram) > 0 &&
    Number(values.disk) > 0 &&
    Number(values.gpu) >= 0 &&
    Number(values.jobDuration) > 0 &&
    queueWaitTimeValid
  )
}
