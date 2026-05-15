import type {
  AlertDTO,
  AttemptStatusDTO,
  ClassAverageDto,
  FailureRateDTO,
  MySummaryDataDto,
  MyTestStatsDto,
  StudentAverageDto,
  TestFailureRateChartDTO,
  ThresholdDTO,
} from "@/types/api/generated";

export type StudentAverage = StudentAverageDto;
export type MyCourseSummary = MySummaryDataDto;
export type MyTestStats = MyTestStatsDto;
export type AttemptStatus = AttemptStatusDTO;
export type ClassAverage = ClassAverageDto;
export type FailureRate = FailureRateDTO;
export type FailureRateChart = TestFailureRateChartDTO;
export type FailureRateAlertPayload = ThresholdDTO;
export type FailureRateAlert = AlertDTO;
