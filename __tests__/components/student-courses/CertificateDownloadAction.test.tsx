import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/student-courses/certificates', () => ({
  downloadCertificatePdf: vi.fn(),
  fetchCertificateCourseVisibility: vi.fn(),
  findEnrollmentForCourse: vi.fn(),
}))

import { downloadCertificatePdf, fetchCertificateCourseVisibility, findEnrollmentForCourse } from '@/lib/student-courses/certificates'
import CertificateDownloadAction from '@/components/student-courses/CertificateDownloadAction'

const mockDownload = vi.mocked(downloadCertificatePdf)
const mockFetchVisibility = vi.mocked(fetchCertificateCourseVisibility)
const mockFindEnrollment = vi.mocked(findEnrollmentForCourse)

const publicEnrollment = {
  id: 'c1',
  title: 'React Fundamentals',
  description: '',
  category: 'Web',
  status: 'PUBLISHED' as const,
  visibility: 'PUBLIC' as const,
  createdBy: 'u1',
  progressPercent: 100,
  enrollmentId: 'e1',
}

describe('CertificateDownloadAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows checking state initially', () => {
    mockFindEnrollment.mockReturnValue(new Promise(() => {}))
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(screen.getByText('Checking certificate...')).toBeInTheDocument()
  })

  it('shows incomplete when progress < 100', async () => {
    const incompleteEnrollment = { ...publicEnrollment, progressPercent: 50 }
    mockFindEnrollment.mockResolvedValue(incompleteEnrollment)
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText(/Complete this course/)).toBeInTheDocument()
  })

  it('shows Download certificate button when available', async () => {
    mockFindEnrollment.mockResolvedValue(publicEnrollment)
    mockFetchVisibility.mockResolvedValue('PUBLIC')
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText('Download certificate')).toBeInTheDocument()
  })

  it('shows private message when visibility is PRIVATE', async () => {
    mockFindEnrollment.mockResolvedValue(publicEnrollment)
    mockFetchVisibility.mockResolvedValue('PRIVATE')
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText(/Certificate unavailable for private courses/)).toBeInTheDocument()
  })

  it('shows error when enrollment check fails', async () => {
    mockFindEnrollment.mockRejectedValue(new Error('Network error'))
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })

  it('shows error when token is missing', async () => {
    render(<CertificateDownloadAction token="" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText(/Sign in again/)).toBeInTheDocument()
  })

  it('shows Retry certificate button on error', async () => {
    mockFindEnrollment.mockRejectedValue(new Error('fail'))
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    expect(await screen.findByText('Retry certificate')).toBeInTheDocument()
  })

  it('uses provided enrollment without finding one', async () => {
    mockFetchVisibility.mockResolvedValue('PUBLIC')
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" enrollment={publicEnrollment} visibility="PUBLIC" />)
    expect(await screen.findByText('Download certificate')).toBeInTheDocument()
    expect(mockFindEnrollment).not.toHaveBeenCalled()
  })

  it('handles download on button click', async () => {
    mockFindEnrollment.mockResolvedValue(publicEnrollment)
    mockFetchVisibility.mockResolvedValue('PUBLIC')
    mockDownload.mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
    const createObjectURL = vi.fn(() => 'blob:url')
    window.URL.createObjectURL = createObjectURL
    window.URL.revokeObjectURL = vi.fn()

    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    const btn = await screen.findByText('Download certificate')
    fireEvent.click(btn)
    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledWith('tok', 'e1')
    })
  })

  it('shows download error when download fails', async () => {
    mockFindEnrollment.mockResolvedValue(publicEnrollment)
    mockFetchVisibility.mockResolvedValue('PUBLIC')
    mockDownload.mockRejectedValue(new Error('Download failed'))

    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" />)
    const btn = await screen.findByText('Download certificate')
    fireEvent.click(btn)
    expect(await screen.findByText('Download failed')).toBeInTheDocument()
  })

  it('renders compact variant', async () => {
    mockFindEnrollment.mockResolvedValue(publicEnrollment)
    mockFetchVisibility.mockResolvedValue('PUBLIC')
    render(<CertificateDownloadAction token="tok" courseId="c1" courseTitle="React" compact={true} />)
    expect(await screen.findByText('Download certificate')).toBeInTheDocument()
  })
})
