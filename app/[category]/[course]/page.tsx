'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Course {
  uuid: string;
  category: string;
  course_name: string;
  course_description: string;
  seq_order: number;
}

interface Item {
  uuid: string;
  item_type: string;
}

export default function CourseDetailPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const categoryUuid = params.category as string;
  const courseUuid = params.course as string;

  useEffect(() => {
    // Fetch course info from API
    if (categoryUuid && courseUuid) {
      fetch(`/api/courses?category_uuid=${encodeURIComponent(categoryUuid)}`, {
        cache: 'no-store'
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            const courses: Course[] = result.data;
            const course = courses.find((c: Course) => c.uuid === courseUuid);
            if (course) {
              setSelectedCourse(course);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching course data:', error);
        });
    }
  }, [categoryUuid, courseUuid]);

  useEffect(() => {
    if (courseUuid) {
      // Fetch items for this course
      fetch(`/api/items?course_uuid=${encodeURIComponent(courseUuid)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data) {
            setItems(result.data);
            // Auto-redirect to first item if items exist
            if (result.data.length > 0) {
              router.replace(`/${categoryUuid}/${courseUuid}/${result.data[0].uuid}`);
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching items:', error);
          setLoading(false);
        });
    }
  }, [courseUuid, categoryUuid, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Loading...
        </p>
      </div>
    );
  }

  if (!selectedCourse) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Course not found
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
          {selectedCourse.course_name}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          No items available in this course
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <p className="text-zinc-500 dark:text-zinc-400 text-center">
        Loading items...
      </p>
    </div>
  );
}

