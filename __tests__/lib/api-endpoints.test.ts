import { describe, it, expect } from 'vitest'
import { ENDPOINTS } from '@/lib/api-endpoints'

describe('ENDPOINTS', () => {
  it('has auth endpoints', () => {
    expect(ENDPOINTS.auth.login).toBe('/api/v1/auth/login')
    expect(ENDPOINTS.auth.refresh).toBe('/api/v1/auth/refresh')
    expect(ENDPOINTS.auth.csrf).toBe('/api/v1/auth/csrf')
    expect(ENDPOINTS.auth.logout).toBe('/api/v1/auth/logout')
  })

  it('has users endpoints', () => {
    expect(ENDPOINTS.users.list).toBe('/api/v1/users')
    expect(ENDPOINTS.users.byId('u1')).toBe('/api/v1/users/u1')
    expect(ENDPOINTS.users.status('u1')).toBe('/api/v1/users/u1/status')
    expect(ENDPOINTS.users.changePassword('u1')).toBe('/api/v1/users/u1/change-password')
  })

  it('has organizations endpoints', () => {
    expect(ENDPOINTS.organizations.list).toBe('/api/v1/organizations')
    expect(ENDPOINTS.organizations.byId('o1')).toBe('/api/v1/organizations/o1')
    expect(ENDPOINTS.organizations.subscription('o1')).toBe('/api/v1/organizations/o1/subscription')
    expect(ENDPOINTS.organizations.subscriptionCheckout('o1')).toBe('/api/v1/organizations/o1/subscription/checkout')
  })

  it('has courses endpoints', () => {
    expect(ENDPOINTS.courses.public).toBe('/api/v1/courses/public')
    expect(ENDPOINTS.courses.myCourses).toBe('/api/v1/courses/my-courses')
    expect(typeof ENDPOINTS.courses.byId).toBe('function')
    expect(ENDPOINTS.courses.byId('c1')).toBe('/api/v1/courses/c1')
  })

  it('has subscriptionPlans endpoint', () => {
    expect(ENDPOINTS.subscriptionPlans).toBe('/api/v1/subscription-plans')
  })

  it('has dynamic student endpoints', () => {
    expect(ENDPOINTS.students.myTestStats('t1')).toBe('/api/v1/students/me/tests/t1/stats')
    expect(ENDPOINTS.students.myCourseStats('c1')).toBe('/api/v1/students/me/courses/c1/stats')
    expect(ENDPOINTS.students.coursesProgress('s1')).toBe('/api/v1/students/s1/courses-progress')
  })

  it('has chapters and lessons endpoints', () => {
    expect(ENDPOINTS.chapters.lessons('ch1')).toBe('/api/v1/chapters/ch1/lessons')
    expect(ENDPOINTS.chapters.byId('ch1')).toBe('/api/v1/chapters/ch1')
    expect(ENDPOINTS.lessons.byId('l1')).toBe('/api/v1/lessons/l1')
    expect(ENDPOINTS.lessons.test('l1')).toBe('/api/v1/lessons/l1/test')
    expect(ENDPOINTS.lessons.resources('l1')).toBe('/api/v1/lessons/l1/resources')
    expect(ENDPOINTS.lessons.resourceById('l1', 'r1')).toBe('/api/v1/lessons/l1/resources/r1')
    expect(ENDPOINTS.lessons.aiGenerateTest('l1')).toBe('/api/v1/lessons/l1/ai/generate-test')
  })

  it('has tests and questions endpoints', () => {
    expect(ENDPOINTS.tests.byId('t1')).toBe('/api/v1/tests/t1')
    expect(ENDPOINTS.tests.publish('t1')).toBe('/api/v1/tests/t1/publish')
    expect(ENDPOINTS.tests.start('t1')).toBe('/api/v1/tests/t1/start')
    expect(ENDPOINTS.tests.questions('t1')).toBe('/api/v1/tests/t1/questions')
    expect(ENDPOINTS.tests.questionById('t1', 5)).toBe('/api/v1/tests/t1/questions/5')
    expect(ENDPOINTS.tests.myBest('t1')).toBe('/api/v1/tests/t1/my-best')
    expect(ENDPOINTS.tests.myAttempts('t1')).toBe('/api/v1/tests/t1/my-attempts')
    expect(ENDPOINTS.tests.analyticsClassAverage('t1')).toBe('/api/v1/tests/t1/analytics/class-average')
  })

  it('has attempts endpoints', () => {
    expect(ENDPOINTS.attempts.submit('a1')).toBe('/api/v1/attempts/a1/submit')
    expect(ENDPOINTS.attempts.result('a1')).toBe('/api/v1/attempts/a1/result')
  })

  it('has adaptive endpoints', () => {
    expect(ENDPOINTS.adaptive.start).toBe('/api/v1/adaptive/start')
    expect(ENDPOINTS.adaptive.jobs).toBe('/api/v1/adaptive/jobs')
    expect(ENDPOINTS.adaptive.jobStatus('job1')).toBe('/api/v1/adaptive/jobs/job1')
    expect(ENDPOINTS.adaptive.submitSession('s1')).toBe('/api/v1/adaptive/sessions/s1/submit')
  })

  it('has classrooms endpoints', () => {
    expect(ENDPOINTS.classrooms.list).toBe('/api/v1/classrooms')
    expect(ENDPOINTS.classrooms.byId('cls1')).toBe('/api/v1/classrooms/cls1')
    expect(ENDPOINTS.classrooms.members('cls1')).toBe('/api/v1/classrooms/cls1/members')
    expect(ENDPOINTS.classrooms.courses('cls1')).toBe('/api/v1/classrooms/cls1/courses')
  })

  it('has AI endpoints', () => {
    expect(ENDPOINTS.ai.requestStatus('req1')).toBe('/api/v1/ai/requests/req1/status')
    expect(ENDPOINTS.ai.injectQuestions('req1')).toBe('/api/v1/ai/request/req1/inject')
    expect(ENDPOINTS.ai.curriculumCatalog).toBe('/api/v1/ai/catalog/curriculum')
  })

  it('has courses dynamic endpoints', () => {
    expect(ENDPOINTS.courses.fullView('c1')).toBe('/api/v1/courses/c1/full-view')
    expect(ENDPOINTS.courses.chapters('c1')).toBe('/api/v1/courses/c1/chapters')
    expect(ENDPOINTS.courses.enroll('c1')).toBe('/api/v1/courses/c1/enroll')
    expect(ENDPOINTS.courses.studentsProgress('c1')).toBe('/api/v1/courses/c1/students-progress')
    expect(ENDPOINTS.courses.myProgress('c1')).toBe('/api/v1/courses/c1/my-progress')
  })

  it('has parents endpoints', () => {
    expect(ENDPOINTS.parents.list).toBe('/api/v1/parents')
    expect(ENDPOINTS.parents.byId('p1')).toBe('/api/v1/parents/p1')
    expect(ENDPOINTS.parents.students('p1')).toBe('/api/v1/parents/p1/students')
    expect(ENDPOINTS.parents.assignStudent('p1', 's1')).toBe('/api/v1/parents/p1/students/s1')
  })

  it('has professors endpoints', () => {
    expect(ENDPOINTS.professors.meAlerts).toBe('/api/v1/professors/me/alerts')
    expect(ENDPOINTS.professors.meLessonsRatings).toBe('/api/v1/professors/me/lessons/ratings')
    expect(ENDPOINTS.professors.errorReports('p1')).toBe('/api/v1/professors/p1/error-reports')
  })

  it('has enrollments endpoint', () => {
    expect(ENDPOINTS.enrollments.certificate('e1')).toBe('/api/v1/enrollments/e1/certificat')
  })

  it('has rewards endpoints', () => {
    expect(ENDPOINTS.rewards.organizationConfig('o1')).toBe('/api/v1/rewards/organizations/o1/config')
    expect(ENDPOINTS.rewards.organizationLatest('o1')).toBe('/api/v1/rewards/organizations/o1/latest')
    expect(ENDPOINTS.rewards.calculateCycle('o1')).toBe('/api/v1/rewards/cycles/o1/calculate')
    expect(ENDPOINTS.rewards.cycle('c1')).toBe('/api/v1/rewards/cycles/c1')
    expect(ENDPOINTS.rewards.mintCycle('c1')).toBe('/api/v1/rewards/cycles/c1/mint')
    expect(ENDPOINTS.rewards.studentRewards('s1')).toBe('/api/v1/rewards/students/s1')
    expect(ENDPOINTS.rewards.myWallet).toBe('/api/v1/rewards/students/me/wallet')
  })
})
