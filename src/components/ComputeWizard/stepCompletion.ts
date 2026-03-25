import { FormComputeData } from './_types'

type ComputeResourceValues = Pick<
  FormComputeData,
  'cpu' | 'ram' | 'disk' | 'gpu' | 'jobDuration'
>

export function isComputeEnvironmentConfigured(
  values: ComputeResourceValues
): boolean {
  return (
    Number(values.cpu) > 0 &&
    Number(values.ram) > 0 &&
    Number(values.disk) > 0 &&
    Number(values.gpu) >= 0 &&
    Number(values.jobDuration) > 0
  )
}
