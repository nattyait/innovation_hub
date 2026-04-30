import { useState, useEffect } from 'react'
import { classroomApi } from '../shared/api'
import type { ClassroomCourse } from '../shared/types'
import { PageHeader } from '../shared/components/PageHeader'

export function ClassroomPage() {
  const [courses, setCourses] = useState<ClassroomCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    classroomApi.list().then(({ data }) => setCourses(data)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Innovation Classroom" />
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)]">กำลังโหลด...</div>
        ) : (
          courses.map((course) => (
            <a
              key={course.id}
              href={course.deep_link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[var(--color-bg-surface)] rounded-[var(--radius-card)] shadow-card overflow-hidden"
            >
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[var(--color-bg-badge)] text-[var(--color-primary)] text-xs px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {course.duration_minutes} นาที
                  </span>
                </div>
                <h3 className="font-semibold text-base leading-snug">{course.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{course.description}</p>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
