'use client';

import { useState, useEffect } from 'react';
import { X, Check, X as XIcon, ChevronLeft, ChevronRight, Edit2, Save, Plus, GripVertical, Trash2, CircleEllipsis, ArrowLeft } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserRecord {
  email: string;
  intro_vid: boolean;
  track1_a: boolean;
  track1_b: boolean;
  track1_bonus: boolean;
  track1_quiz: boolean;
  track2_a: boolean;
  track2_b: boolean;
  track2_bonus: boolean;
  track2_quiz: boolean;
  track3_a: boolean;
  track3_b: boolean;
  track3_bonus: boolean;
  track3_quiz: boolean;
  track4_a: boolean;
  track4_b: boolean;
  track4_bonus: boolean;
  track4_quiz: boolean;
  bonustrack_vid: boolean;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Category {
  uuid: string;
  category: string;
  category_description: string | null;
  category_order: number;
}

interface Course {
  uuid: string;
  course_name: string;
  course_description: string | null;
  category: string;
  seq_order: number;
}

interface GroupedCourses {
  category: string;
  courses: Course[];
}

interface Item {
  uuid: string;
  item_type: string;
  course: string;
  item_order: number;
  video_title?: string | null;
  video_url?: string | null;
  video_duration?: string | null;
  video_description?: string | null;
  document_title?: string | null;
  document_description?: string | null;
  document_url?: string | null;
  link_title?: string | null;
  link_url?: string | null;
  podcast_title?: string | null;
  podcast_url?: string | null;
  quiz?: string | null;
  text_title?: string | null;
  text_content?: string | null;
}

interface CourseWithItems extends Course {
  items: Item[];
}

interface CategoryWithCourses {
  category: string;
  category_order: number;
  courses: CourseWithItems[];
}

function SortableCourseItem({
  course,
  isEditing,
  editCourseName,
  editCourseDescription,
  editCourseCategory,
  categories,
  onEditNameChange,
  onEditDescriptionChange,
  onEditCategoryChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  course: Course;
  isEditing: boolean;
  editCourseName: string;
  editCourseDescription: string;
  editCourseCategory: string;
  categories: Category[];
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditCategoryChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {isEditing ? (
        <>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={editCourseName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
              placeholder="Course name"
            />
            <textarea
              value={editCourseDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
              placeholder="Course description"
              rows={2}
            />
            <select
              value={editCourseCategory}
              onChange={(e) => onEditCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.uuid} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="font-medium text-black dark:text-zinc-50">
              {course.course_name}
            </div>
            {course.course_description && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {course.course_description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SortableItemItem({
  item,
  getItemDisplayTitle,
  onItemClick,
}: {
  item: Item;
  getItemDisplayTitle: (item: Item) => string;
  onItemClick: (item: Item) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors cursor-pointer"
      onClick={() => onItemClick(item)}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <span className="flex-1 text-sm text-black dark:text-zinc-50">
        {getItemDisplayTitle(item)}
      </span>
      <div
        className="p-1.5 text-zinc-500 dark:text-zinc-400"
        title="View details"
      >
        <CircleEllipsis className="w-4 h-4" />
      </div>
    </div>
  );
}

function SortableCategoryItem({
  category,
  isEditing,
  editCategoryName,
  editCategoryDescription,
  onEditNameChange,
  onEditDescriptionChange,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  category: Category;
  isEditing: boolean;
  editCategoryName: string;
  editCategoryDescription: string;
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {isEditing ? (
        <>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => onEditNameChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
              placeholder="Category name"
            />
            <textarea
              value={editCategoryDescription}
              onChange={(e) => onEditDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
              placeholder="Category description"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="font-medium text-black dark:text-zinc-50">
              {category.category}
            </div>
            {category.category_description && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {category.category_description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SortableQuestionItem({
  question,
  isEditing,
  editedQuestion,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
}: {
  question: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    quiz_order: number;
  };
  isEditing: boolean;
  editedQuestion: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
  } | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onQuestionChange: (value: string) => void;
  onOptionChange: (index: number, value: string) => void;
  onCorrectAnswerChange: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="flex flex-col items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          {!isEditing && (
            <>
              <button
                onClick={onEdit}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <div className="flex-1">
          {isEditing && editedQuestion ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Question {question.quiz_order}:
                </label>
                <textarea
                  value={editedQuestion.question}
                  onChange={(e) => onQuestionChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                  rows={3}
                />
              </div>
              <div className="space-y-2 mb-4">
                {editedQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={editedQuestion.correct_answer === index}
                      onChange={() => onCorrectAnswerChange(index)}
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                      placeholder={`Option ${index + 1}`}
                    />
                    {editedQuestion.correct_answer === index && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">(Correct)</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h4 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
                Question {question.quiz_order} — {question.question}
              </h4>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      question.correct_answer === index
                        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={question.correct_answer === index}
                      readOnly
                      className="w-4 h-4 text-green-600 dark:text-green-400 cursor-default"
                    />
                    <span className={`flex-1 ${
                      question.correct_answer === index
                        ? 'text-green-700 dark:text-green-300 font-medium'
                        : 'text-black dark:text-zinc-50'
                    }`}>
                      {option}
                      {question.correct_answer === index && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct Answer)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [selectedNavItem, setSelectedNavItem] = useState('Users');
  const [selectedContentPill, setSelectedContentPill] = useState('Categories');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [emailSearch, setEmailSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDescription, setEditCategoryDescription] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<{ uuid: string; name: string } | null>(null);
  const [groupedCourses, setGroupedCourses] = useState<GroupedCourses[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<{ uuid: string; name: string } | null>(null);
  const [itemsData, setItemsData] = useState<CategoryWithCourses[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editedItem, setEditedItem] = useState<Partial<Item>>({});
  const [itemToDelete, setItemToDelete] = useState<{ uuid: string; name: string } | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemCourse, setNewItemCourse] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemFields, setNewItemFields] = useState<Record<string, string>>({});
  const [itemTypes, setItemTypes] = useState<{ item_type: string }[]>([]);
  const [quizzes, setQuizzes] = useState<Array<{ uuid: string; quiz_name: string }>>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    quiz_order: number;
  }>>([]);
  const [quizQuestionsLoading, setQuizQuestionsLoading] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [newQuizName, setNewQuizName] = useState('');
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editQuizName, setEditQuizName] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<{
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
  } | null>(null);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', '']);
  const [newQuestionCorrectAnswer, setNewQuestionCorrectAnswer] = useState<number>(0);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: string; question: string } | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<{ uuid: string; name: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchUsers = async (page: number = 1, email: string = '', showLoading: boolean = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (email) {
        params.append('email', email);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (result.data) {
        setUsers(result.data);
        setPagination(result.pagination || pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && selectedNavItem === 'Users') {
      // Reset search when opening or switching nav items
      setEmailSearch('');
      fetchUsers(1, '');
    } else if (isOpen && selectedNavItem === 'Content') {
      // Reset content pill to Categories when switching to Content
      setSelectedContentPill('Categories');
    } else if (isOpen && selectedNavItem === 'Quizzes') {
      fetchQuizzes();
      setSelectedQuiz('');
      setQuizQuestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedNavItem]);

  useEffect(() => {
    if (isOpen && selectedNavItem === 'Content') {
      if (selectedContentPill === 'Categories') {
        fetchCategories();
      } else if (selectedContentPill === 'Courses') {
        // Fetch both categories (for dropdown) and courses
        fetchCategories();
        fetchCourses();
      } else if (selectedContentPill === 'Items') {
        fetchItems();
        fetchItemTypes();
        fetchQuizzes();
        fetchCategories();
        fetchCourses();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedNavItem, selectedContentPill]);

  useEffect(() => {
    // Debounce search - only run if panel is open and Users is selected
    if (!isOpen || selectedNavItem !== 'Users') return;

    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      fetchUsers(1, emailSearch, false); // Don't show loading for search
    }, 300);

    setSearchDebounce(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailSearch, isOpen, selectedNavItem]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, emailSearch);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category.uuid);
    setEditCategoryName(category.category);
    setEditCategoryDescription(category.category_description || '');
  };

  const handleSaveCategory = async (uuid: string) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid,
          category: editCategoryName,
          category_description: editCategoryDescription,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchCategories();
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryDescription('');
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete({ uuid: category.uuid, name: category.category });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/admin/categories?uuid=${categoryToDelete.uuid}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchCategories();
        // If we were editing this category, cancel the edit
        if (editingCategory === categoryToDelete.uuid) {
          handleCancelEdit();
        }
        setCategoryToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const cancelDeleteCategory = () => {
    setCategoryToDelete(null);
  };

  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const response = await fetch('/api/admin/courses');
      const result = await response.json();
      if (result.data) {
        setGroupedCourses(result.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course.uuid);
    setEditCourseName(course.course_name);
    setEditCourseDescription(course.course_description || '');
    setEditCourseCategory(course.category);
  };

  const handleSaveCourse = async (uuid: string) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid,
          course_name: editCourseName,
          course_description: editCourseDescription,
          category: editCourseCategory,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchCourses();
        setEditingCourse(null);
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleCancelEditCourse = () => {
    setEditingCourse(null);
    setEditCourseName('');
    setEditCourseDescription('');
    setEditCourseCategory('');
  };

  const handleAddCourse = async () => {
    if (!newCourseName.trim() || !newCourseCategory) return;
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_name: newCourseName,
          course_description: newCourseDescription || null,
          category: newCourseCategory,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchCourses();
        setShowAddCourse(false);
        setNewCourseName('');
        setNewCourseDescription('');
        setNewCourseCategory('');
      }
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete({ uuid: course.uuid, name: course.course_name });
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const response = await fetch(`/api/admin/courses?uuid=${courseToDelete.uuid}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchCourses();
        if (editingCourse === courseToDelete.uuid) {
          handleCancelEditCourse();
        }
        setCourseToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const cancelDeleteCourse = () => {
    setCourseToDelete(null);
  };

  const fetchItems = async () => {
    setItemsLoading(true);
    try {
      const response = await fetch('/api/admin/items');
      const result = await response.json();
      if (result.data) {
        setItemsData(result.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchItemTypes = async () => {
    try {
      const response = await fetch('/api/admin/item-types');
      const result = await response.json();
      if (result.data) {
        setItemTypes(result.data);
      }
    } catch (error) {
      console.error('Error fetching item types:', error);
    }
  };

  const fetchQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const response = await fetch('/api/admin/quizzes');
      const result = await response.json();
      if (result.data) {
        setQuizzes(result.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleEditQuiz = (quiz: { uuid: string; quiz_name: string }) => {
    setEditingQuiz(quiz.uuid);
    setEditQuizName(quiz.quiz_name);
  };

  const handleSaveQuiz = async (uuid: string) => {
    try {
      const oldQuiz = quizzes.find(q => q.uuid === uuid);
      const response = await fetch('/api/admin/quizzes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid,
          quiz_name: editQuizName,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchQuizzes();
        setEditingQuiz(null);
        // If we were viewing this quiz's questions, update the selected quiz name and refetch questions
        if (selectedQuiz && oldQuiz && oldQuiz.quiz_name === selectedQuiz) {
          setSelectedQuiz(editQuizName);
          // Refetch questions with the new quiz name
          await fetchQuizQuestions(editQuizName);
        }
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  const handleCancelEditQuiz = () => {
    setEditingQuiz(null);
    setEditQuizName('');
  };

  const handleDeleteQuiz = (quiz: { uuid: string; quiz_name: string }) => {
    setQuizToDelete({ uuid: quiz.uuid, name: quiz.quiz_name });
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      const response = await fetch(`/api/admin/quizzes?uuid=${quizToDelete.uuid}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchQuizzes();
        // If we were viewing this quiz's questions, clear the selection
        if (selectedQuiz === quizToDelete.name) {
          setSelectedQuiz('');
          setQuizQuestions([]);
        }
        // If we were editing this quiz, cancel the edit
        const currentQuiz = quizzes.find(q => q.uuid === quizToDelete.uuid);
        if (currentQuiz && editingQuiz === quizToDelete.uuid) {
          handleCancelEditQuiz();
        }
        setQuizToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const cancelDeleteQuiz = () => {
    setQuizToDelete(null);
  };

  const handleSaveQuestion = async () => {
    if (!editedQuestion) return;

    try {
      const response = await fetch('/api/admin/quiz-questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedQuestion),
      });
      const result = await response.json();
      if (result.data) {
        await fetchQuizQuestions(selectedQuiz);
        setEditingQuestion(null);
        setEditedQuestion(null);
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedQuiz || !newQuestionText.trim()) return;
    
    const validOptions = newQuestionOptions.filter(o => o.trim());
    if (validOptions.length < 2) {
      return;
    }

    try {
      const response = await fetch('/api/admin/quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_name: selectedQuiz,
          question: newQuestionText.trim(),
          options: validOptions,
          correct_answer: newQuestionCorrectAnswer,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchQuizQuestions(selectedQuiz);
        setShowAddQuestion(false);
        setNewQuestionText('');
        setNewQuestionOptions(['', '']);
        setNewQuestionCorrectAnswer(0);
      }
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const handleDeleteQuestion = (question: { id: string; question: string }) => {
    setQuestionToDelete({ id: question.id, question: question.question });
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      const response = await fetch(`/api/admin/quiz-questions?id=${questionToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchQuizQuestions(selectedQuiz);
        // If we were editing this question, cancel the edit
        if (editingQuestion === questionToDelete.id) {
          setEditingQuestion(null);
          setEditedQuestion(null);
        }
        setQuestionToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const cancelDeleteQuestion = () => {
    setQuestionToDelete(null);
  };

  const handleQuestionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = quizQuestions.findIndex((q) => q.id === active.id);
    const newIndex = quizQuestions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newQuestions = arrayMove(quizQuestions, oldIndex, newIndex);
    setQuizQuestions(newQuestions);

    // Update quiz_order in database
    const updates = newQuestions.map((q, index) => ({
      id: q.id,
      quiz_order: index + 1,
    }));

    try {
      await fetch('/api/admin/quiz-questions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_name: selectedQuiz, questions: updates }),
      });
    } catch (error) {
      console.error('Error reordering questions:', error);
      await fetchQuizQuestions(selectedQuiz);
    }
  };

  const fetchQuizQuestions = async (quizName: string) => {
    if (!quizName) {
      setQuizQuestions([]);
      return;
    }
    setQuizQuestionsLoading(true);
    try {
      const response = await fetch(`/api/admin/quiz-questions?quiz_name=${encodeURIComponent(quizName)}`);
      const result = await response.json();
      if (result.data) {
        setQuizQuestions(result.data);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    } finally {
      setQuizQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuizQuestions(selectedQuiz);
    } else {
      setQuizQuestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuiz]);

  const getItemDisplayTitle = (item: Item): string => {
    switch (item.item_type) {
      case 'document':
        return item.document_title || 'Untitled Document';
      case 'link':
        return item.link_title || 'Untitled Link';
      case 'podcast':
        return item.podcast_title || 'Untitled Podcast';
      case 'quiz':
        return item.quiz || 'Untitled Quiz';
      case 'text':
        return item.text_title || 'Untitled Text';
      case 'video':
        return item.video_title || 'Untitled Video';
      case 'video_doc':
        return item.video_title || 'Untitled Video Document';
      default:
        return 'Unknown Item';
    }
  };

  const handleEditItem = () => {
    if (selectedItem && selectedItem.item_type !== 'quiz') {
      setEditedItem({ ...selectedItem });
      setIsEditingItem(true);
    }
  };

  const handleCancelEditItem = () => {
    setIsEditingItem(false);
    setEditedItem({});
  };

  const handleSaveItem = async () => {
    if (!selectedItem || !editedItem.uuid) return;

    try {
      const response = await fetch('/api/admin/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedItem),
      });
      const result = await response.json();
      if (result.data) {
        // Refresh items data
        await fetchItems();
        // Update selected item with new data
        setSelectedItem(result.data);
        setIsEditingItem(false);
        setEditedItem({});
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const updateEditedItemField = (field: string, value: string | null) => {
    setEditedItem((prev) => ({
      ...prev,
      [field]: value || null,
    }));
  };

  const handleDeleteItem = (item: Item) => {
    const itemName = getItemDisplayTitle(item);
    setItemToDelete({ uuid: item.uuid, name: itemName });
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/admin/items?uuid=${itemToDelete.uuid}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchItems();
        // Close modal if the deleted item was selected
        if (selectedItem?.uuid === itemToDelete.uuid) {
          setSelectedItem(null);
          setIsEditingItem(false);
          setEditedItem({});
        }
        setItemToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const cancelDeleteItem = () => {
    setItemToDelete(null);
  };

  const handleItemDragEnd = async (event: DragEndEvent, courseName: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // Find the course in itemsData
    let targetCourse: CourseWithItems | null = null;
    let targetCategoryGroup: CategoryWithCourses | null = null;

    for (const categoryGroup of itemsData) {
      const course = categoryGroup.courses.find((c) => c.course_name === courseName);
      if (course) {
        targetCourse = course;
        targetCategoryGroup = categoryGroup;
        break;
      }
    }

    if (!targetCourse || !targetCategoryGroup) return;

    const oldIndex = targetCourse.items.findIndex((item) => item.uuid === active.id);
    const newIndex = targetCourse.items.findIndex((item) => item.uuid === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(targetCourse.items, oldIndex, newIndex);
    
    // Update local state
    const updatedItemsData = itemsData.map((categoryGroup) => {
      if (categoryGroup.category === targetCategoryGroup!.category) {
        return {
          ...categoryGroup,
          courses: categoryGroup.courses.map((course) =>
            course.course_name === courseName
              ? { ...course, items: newItems }
              : course
          ),
        };
      }
      return categoryGroup;
    });
    setItemsData(updatedItemsData);

    // Update item_order in database
    const updates = newItems.map((item, index) => ({
      uuid: item.uuid,
      item_order: index + 1,
    }));

    try {
      await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseName, items: updates }),
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      await fetchItems();
    }
  };

  const handleAddItem = async () => {
    if (!newItemCourse || !newItemType) return;

    try {
      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: newItemCourse,
          item_type: newItemType,
          ...newItemFields,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchItems();
        setShowAddItem(false);
        setNewItemCourse('');
        setNewItemType('');
        setNewItemFields({});
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const updateNewItemField = (field: string, value: string) => {
    setNewItemFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCourseDragEnd = async (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryGroup = groupedCourses.find((g) => g.category === category);
    if (!categoryGroup) return;

    const oldIndex = categoryGroup.courses.findIndex((course) => course.uuid === active.id);
    const newIndex = categoryGroup.courses.findIndex((course) => course.uuid === over.id);

    const newCourses = arrayMove(categoryGroup.courses, oldIndex, newIndex);
    const updatedGroupedCourses = groupedCourses.map((group) =>
      group.category === category
        ? { ...group, courses: newCourses }
        : group
    );
    setGroupedCourses(updatedGroupedCourses);

    // Update seq_order in database
    const updates = newCourses.map((course, index) => ({
      uuid: course.uuid,
      seq_order: index + 1,
    }));

    try {
      await fetch('/api/admin/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, courses: updates }),
      });
    } catch (error) {
      console.error('Error reordering courses:', error);
      await fetchCourses();
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newCategoryName,
          category_description: newCategoryDescription || null,
        }),
      });
      const result = await response.json();
      if (result.data) {
        await fetchCategories();
        setShowAddCategory(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.uuid === active.id);
    const newIndex = categories.findIndex((cat) => cat.uuid === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(newCategories);

    // Update category_order in database
    const updates = newCategories.map((cat, index) => ({
      uuid: cat.uuid,
      category_order: index + 1,
    }));

    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: updates }),
      });
    } catch (error) {
      console.error('Error reordering categories:', error);
      // Revert on error
      await fetchCategories();
    }
  };

  const renderBooleanCell = (value: boolean) => {
    return (
      <div className="flex justify-center">
        {value ? (
          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : (
          <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-900 z-50 flex flex-col">
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-10">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        {/* Left Navigation */}
        <aside className="w-80 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setSelectedNavItem('Users')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedNavItem === 'Users'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setSelectedNavItem('Content')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedNavItem === 'Content'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Content
              </button>
              <button
                onClick={() => setSelectedNavItem('Quizzes')}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                  selectedNavItem === 'Quizzes'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-zinc-50 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-400'
                }`}
              >
                Quizzes
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-6">
            {selectedNavItem === 'Users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                    Users
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={emailSearch}
                      onChange={(e) => setEmailSearch(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                    />
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="border-collapse" style={{ minWidth: '2000px' }}>
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="sticky left-0 z-20 bg-white dark:bg-zinc-900 text-left px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-[200px]">
                              Email
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              Intro
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              1-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              1-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              2-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              2-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              3-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              3-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-A
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-B
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              4-Bonus
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600">
                              4-Quiz
                            </th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-black dark:text-zinc-50 min-w-24 w-24">
                              Bonus
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={19} className="text-center px-4 py-8 text-zinc-600 dark:text-zinc-400">
                                No users found
                              </td>
                            </tr>
                          ) : (
                            users.map((user, index) => (
                              <tr
                                key={index}
                                className="border-b border-zinc-200 dark:border-zinc-800 group"
                              >
                                <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950 px-4 py-3 text-sm text-black dark:text-zinc-50 min-w-[200px]">
                                  {user.email}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.intro_vid)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track1_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track2_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track3_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_a)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_b)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_bonus)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 border-r-2 border-zinc-400 dark:border-zinc-600 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.track4_quiz)}
                                </td>
                                <td className="px-4 py-3 min-w-24 w-24 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-950">
                                  {renderBooleanCell(user.bonustrack_vid)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          {pagination.total} users
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 px-4">
                            Page {pagination.page} of {pagination.totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {selectedNavItem === 'Content' && (
              <div className="space-y-4">
                {/* Content Pills */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedContentPill('Categories')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedContentPill === 'Categories'
                        ? 'bg-black dark:bg-zinc-50 text-white dark:text-black font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setSelectedContentPill('Courses')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedContentPill === 'Courses'
                        ? 'bg-black dark:bg-zinc-50 text-white dark:text-black font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Courses
                  </button>
                  <button
                    onClick={() => setSelectedContentPill('Items')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedContentPill === 'Items'
                        ? 'bg-black dark:bg-zinc-50 text-white dark:text-black font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    Items
                  </button>
                </div>

                {/* Categories Content */}
                {selectedContentPill === 'Categories' && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                        Categories
                      </h3>
                      <button
                        onClick={() => setShowAddCategory(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Category
                      </button>
                    </div>

                    {showAddCategory && (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          placeholder="Category name"
                        />
                        <textarea
                          value={newCategoryDescription}
                          onChange={(e) => setNewCategoryDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          placeholder="Category description"
                          rows={2}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategoryName('');
                              setNewCategoryDescription('');
                            }}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {categoriesLoading ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">No categories found</p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={categories.map((cat) => cat.uuid)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <SortableCategoryItem
                                key={category.uuid}
                                category={category}
                                isEditing={editingCategory === category.uuid}
                                editCategoryName={editCategoryName}
                                editCategoryDescription={editCategoryDescription}
                                onEditNameChange={setEditCategoryName}
                                onEditDescriptionChange={setEditCategoryDescription}
                                onEdit={() => handleEditCategory(category)}
                                onSave={() => handleSaveCategory(category.uuid)}
                                onCancel={handleCancelEdit}
                                onDelete={() => handleDeleteCategory(category)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )}

                {/* Courses Content */}
                {selectedContentPill === 'Courses' && (
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                        Courses
                      </h3>
                      <button
                        onClick={() => setShowAddCourse(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Course
                      </button>
                    </div>

                    {showAddCourse && (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                        <input
                          type="text"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          placeholder="Course name"
                        />
                        <textarea
                          value={newCourseDescription}
                          onChange={(e) => setNewCourseDescription(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          placeholder="Course description"
                          rows={2}
                        />
                        <select
                          value={newCourseCategory}
                          onChange={(e) => setNewCourseCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.uuid} value={cat.category}>
                              {cat.category}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddCourse}
                            disabled={!newCourseName.trim() || !newCourseCategory}
                            className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCourse(false);
                              setNewCourseName('');
                              setNewCourseDescription('');
                              setNewCourseCategory('');
                            }}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {coursesLoading ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                      </div>
                    ) : groupedCourses.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">No courses found</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {groupedCourses.map((group) => (
                          <div key={group.category}>
                            <h4 className="text-lg font-semibold text-black dark:text-zinc-50 mb-4">
                              {group.category}
                            </h4>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(e) => handleCourseDragEnd(e, group.category)}
                            >
                              <SortableContext
                                items={group.courses.map((course) => course.uuid)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2">
                                  {group.courses.map((course) => (
                                    <SortableCourseItem
                                      key={course.uuid}
                                      course={course}
                                      isEditing={editingCourse === course.uuid}
                                      editCourseName={editCourseName}
                                      editCourseDescription={editCourseDescription}
                                      editCourseCategory={editCourseCategory}
                                      categories={categories}
                                      onEditNameChange={setEditCourseName}
                                      onEditDescriptionChange={setEditCourseDescription}
                                      onEditCategoryChange={setEditCourseCategory}
                                      onEdit={() => handleEditCourse(course)}
                                      onSave={() => handleSaveCourse(course.uuid)}
                                      onCancel={handleCancelEditCourse}
                                      onDelete={() => handleDeleteCourse(course)}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Items Content */}
                {selectedContentPill === 'Items' && (
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                        Items
                      </h3>
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>

                    {showAddItem && (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Course:</label>
                          <select
                            value={newItemCourse}
                            onChange={(e) => setNewItemCourse(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          >
                            <option value="">Select a course</option>
                            {groupedCourses.map((group) => (
                              <optgroup key={group.category} label={group.category}>
                                {group.courses.map((course) => (
                                  <option key={course.uuid} value={course.course_name}>
                                    {course.course_name}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Item Type:</label>
                          <select
                            value={newItemType}
                            onChange={(e) => {
                              setNewItemType(e.target.value);
                              setNewItemFields({});
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          >
                            <option value="">Select an item type</option>
                            {itemTypes.map((type) => (
                              <option key={type.item_type} value={type.item_type}>
                                {type.item_type}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newItemType === 'document' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                              <input
                                type="text"
                                value={newItemFields.document_title || ''}
                                onChange={(e) => updateNewItemField('document_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description:</label>
                              <textarea
                                value={newItemFields.document_description || ''}
                                onChange={(e) => updateNewItemField('document_description', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document description"
                                rows={4}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                              <input
                                type="text"
                                value={newItemFields.document_url || ''}
                                onChange={(e) => updateNewItemField('document_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document URL"
                              />
                            </div>
                          </>
                        )}

                        {newItemType === 'link' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                              <input
                                type="text"
                                value={newItemFields.link_title || ''}
                                onChange={(e) => updateNewItemField('link_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Link title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                              <input
                                type="text"
                                value={newItemFields.link_url || ''}
                                onChange={(e) => updateNewItemField('link_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Link URL"
                              />
                            </div>
                          </>
                        )}

                        {newItemType === 'podcast' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                              <input
                                type="text"
                                value={newItemFields.podcast_title || ''}
                                onChange={(e) => updateNewItemField('podcast_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Podcast title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                              <textarea
                                value={newItemFields.podcast_url || ''}
                                onChange={(e) => updateNewItemField('podcast_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Podcast URL (HTML)"
                                rows={4}
                              />
                            </div>
                          </>
                        )}

                        {newItemType === 'quiz' && (
                          <div>
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Quiz:</label>
                            <select
                              value={newItemFields.quiz || ''}
                              onChange={(e) => updateNewItemField('quiz', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                            >
                              <option value="">Select a quiz</option>
                              {quizzes.map((quiz) => (
                                <option key={quiz.quiz_name} value={quiz.quiz_name}>
                                  {quiz.quiz_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {newItemType === 'text' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                              <input
                                type="text"
                                value={newItemFields.text_title || ''}
                                onChange={(e) => updateNewItemField('text_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Text title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Content:</label>
                              <textarea
                                value={newItemFields.text_content || ''}
                                onChange={(e) => updateNewItemField('text_content', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Text content (HTML)"
                                rows={8}
                              />
                            </div>
                          </>
                        )}

                        {newItemType === 'video' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                              <input
                                type="text"
                                value={newItemFields.video_title || ''}
                                onChange={(e) => updateNewItemField('video_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                              <input
                                type="text"
                                value={newItemFields.video_url || ''}
                                onChange={(e) => updateNewItemField('video_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video URL"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Duration:</label>
                              <input
                                type="text"
                                value={newItemFields.video_duration || ''}
                                onChange={(e) => updateNewItemField('video_duration', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video duration"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description:</label>
                              <textarea
                                value={newItemFields.video_description || ''}
                                onChange={(e) => updateNewItemField('video_description', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video description"
                                rows={4}
                              />
                            </div>
                          </>
                        )}

                        {newItemType === 'video_doc' && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Title:</label>
                              <input
                                type="text"
                                value={newItemFields.video_title || ''}
                                onChange={(e) => updateNewItemField('video_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video URL:</label>
                              <input
                                type="text"
                                value={newItemFields.video_url || ''}
                                onChange={(e) => updateNewItemField('video_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video URL"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Duration:</label>
                              <input
                                type="text"
                                value={newItemFields.video_duration || ''}
                                onChange={(e) => updateNewItemField('video_duration', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video duration"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Description:</label>
                              <textarea
                                value={newItemFields.video_description || ''}
                                onChange={(e) => updateNewItemField('video_description', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Video description"
                                rows={4}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document Title:</label>
                              <input
                                type="text"
                                value={newItemFields.document_title || ''}
                                onChange={(e) => updateNewItemField('document_title', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document title"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document Description:</label>
                              <textarea
                                value={newItemFields.document_description || ''}
                                onChange={(e) => updateNewItemField('document_description', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document description"
                                rows={4}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document URL:</label>
                              <input
                                type="text"
                                value={newItemFields.document_url || ''}
                                onChange={(e) => updateNewItemField('document_url', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                placeholder="Document URL"
                              />
                            </div>
                          </>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleAddItem}
                            disabled={!newItemCourse || !newItemType}
                            className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddItem(false);
                              setNewItemCourse('');
                              setNewItemType('');
                              setNewItemFields({});
                            }}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {itemsLoading ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                      </div>
                    ) : itemsData.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">No items found</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {itemsData.map((categoryGroup) => (
                          <div key={categoryGroup.category} className="space-y-4">
                            <h4 className="text-lg font-semibold text-black dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                              {categoryGroup.category}
                            </h4>
                            {categoryGroup.courses.map((course) => (
                              <div key={course.uuid} className="ml-4 space-y-2">
                                <h5 className="text-md font-medium text-zinc-700 dark:text-zinc-300">
                                  {course.course_name}
                                </h5>
                                {course.items.length === 0 ? (
                                  <p className="ml-4 text-sm text-zinc-500 dark:text-zinc-500">
                                    No items in this course
                                  </p>
                                ) : (
                                  <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(e) => handleItemDragEnd(e, course.course_name)}
                                  >
                                    <SortableContext
                                      items={course.items.map((item) => item.uuid)}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      <div className="ml-4 space-y-1">
                                        {course.items.map((item) => (
                                          <SortableItemItem
                                            key={item.uuid}
                                            item={item}
                                            getItemDisplayTitle={getItemDisplayTitle}
                                            onItemClick={setSelectedItem}
                                          />
                                        ))}
                                      </div>
                                    </SortableContext>
                                  </DndContext>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedNavItem === 'Quizzes' && (
              <div className="space-y-6">
                {!selectedQuiz ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                        Quizzes
                      </h3>
                      <button
                        onClick={() => setShowAddQuiz(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Quiz
                      </button>
                    </div>

                    {showAddQuiz && (
                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 space-y-3">
                        <div>
                          <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Quiz Name:</label>
                          <input
                            type="text"
                            value={newQuizName}
                            onChange={(e) => setNewQuizName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                            placeholder="Enter quiz name"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              if (!newQuizName.trim()) return;
                              try {
                                const response = await fetch('/api/admin/quizzes', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ quiz_name: newQuizName }),
                                });
                                const result = await response.json();
                                if (result.data) {
                                  await fetchQuizzes();
                                  setShowAddQuiz(false);
                                  setNewQuizName('');
                                }
                              } catch (error) {
                                console.error('Error creating quiz:', error);
                              }
                            }}
                            disabled={!newQuizName.trim()}
                            className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddQuiz(false);
                              setNewQuizName('');
                            }}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {quizzesLoading ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
                      </div>
                    ) : quizzes.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-zinc-600 dark:text-zinc-400">No quizzes found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {quizzes.map((quiz) => (
                          <button
                            key={quiz.uuid}
                            onClick={() => setSelectedQuiz(quiz.quiz_name)}
                            className="w-full p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors text-left"
                          >
                            <span className="text-black dark:text-zinc-50 font-medium">
                              {quiz.quiz_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                      <button
                        onClick={() => {
                          setSelectedQuiz('');
                          setQuizQuestions([]);
                          setEditingQuiz(null);
                          setEditQuizName('');
                        }}
                        className="flex items-center gap-1 hover:text-black dark:hover:text-zinc-50 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quizzes</span>
                      </button>
                      <span>/</span>
                      {editingQuiz ? (
                        <span className="text-black dark:text-zinc-50 font-medium">{selectedQuiz}</span>
                      ) : (
                        <span className="text-black dark:text-zinc-50 font-medium">{selectedQuiz}</span>
                      )}
                    </div>

                    {/* Quiz Questions */}
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        {editingQuiz ? (
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="text"
                              value={editQuizName}
                              onChange={(e) => setEditQuizName(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50 text-xl font-semibold"
                            />
                            <button
                              onClick={() => {
                                const currentQuiz = quizzes.find(q => q.quiz_name === selectedQuiz);
                                if (currentQuiz) {
                                  handleSaveQuiz(currentQuiz.uuid);
                                }
                              }}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                handleCancelEditQuiz();
                              }}
                              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                              {selectedQuiz}
                            </h3>
                            <button
                              onClick={() => {
                                const currentQuiz = quizzes.find(q => q.quiz_name === selectedQuiz);
                                if (currentQuiz) {
                                  handleEditQuiz(currentQuiz);
                                }
                              }}
                              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                const currentQuiz = quizzes.find(q => q.quiz_name === selectedQuiz);
                                if (currentQuiz) {
                                  handleDeleteQuiz(currentQuiz);
                                }
                              }}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {!editingQuiz && (
                          <button
                            onClick={() => {
                              setShowAddQuestion(true);
                              setNewQuestionText('');
                              setNewQuestionOptions(['', '']);
                              setNewQuestionCorrectAnswer(0);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question
                          </button>
                        )}
                      </div>
                      {showAddQuestion && (
                        <div className="mb-6 p-4 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900">
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              Question:
                            </label>
                            <textarea
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                              rows={3}
                              placeholder="Enter the question text"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                              Options:
                            </label>
                            <div className="space-y-2">
                              {newQuestionOptions.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    checked={newQuestionCorrectAnswer === index}
                                    onChange={() => setNewQuestionCorrectAnswer(index)}
                                    className="w-4 h-4 text-green-600 dark:text-green-400"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...newQuestionOptions];
                                      newOptions[index] = e.target.value;
                                      setNewQuestionOptions(newOptions);
                                    }}
                                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  {newQuestionCorrectAnswer === index && (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">(Correct)</span>
                                  )}
                                  {newQuestionOptions.length > 2 && (
                                    <button
                                      onClick={() => {
                                        const newOptions = newQuestionOptions.filter((_, i) => i !== index);
                                        setNewQuestionOptions(newOptions);
                                        if (newQuestionCorrectAnswer >= newOptions.length) {
                                          setNewQuestionCorrectAnswer(newOptions.length - 1);
                                        }
                                      }}
                                      className="p-2 text-red-600 dark:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                            {newQuestionOptions.length < 10 && (
                              <button
                                onClick={() => {
                                  setNewQuestionOptions([...newQuestionOptions, '']);
                                }}
                                className="mt-2 px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                + Add Option
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAddQuestion}
                              disabled={!newQuestionText.trim() || newQuestionOptions.filter(o => o.trim()).length < 2}
                              className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setShowAddQuestion(false);
                                setNewQuestionText('');
                                setNewQuestionOptions(['', '']);
                                setNewQuestionCorrectAnswer(0);
                              }}
                              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {quizQuestionsLoading ? (
                        <div className="text-center py-12">
                          <p className="text-zinc-600 dark:text-zinc-400">Loading questions...</p>
                        </div>
                      ) : quizQuestions.length === 0 && !showAddQuestion ? (
                        <div className="text-center py-12">
                          <p className="text-zinc-600 dark:text-zinc-400">No questions found for this quiz</p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleQuestionDragEnd}
                        >
                          <SortableContext
                            items={quizQuestions.map((q) => q.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-6">
                              {quizQuestions.map((question) => (
                                <SortableQuestionItem
                                  key={question.id}
                                  question={question}
                                  isEditing={editingQuestion === question.id}
                                  editedQuestion={editedQuestion}
                                  onEdit={() => {
                                    setEditingQuestion(question.id);
                                    setEditedQuestion({
                                      id: question.id,
                                      question: question.question,
                                      options: [...question.options],
                                      correct_answer: question.correct_answer,
                                    });
                                  }}
                                  onCancel={() => {
                                    setEditingQuestion(null);
                                    setEditedQuestion(null);
                                  }}
                                  onSave={handleSaveQuestion}
                                  onDelete={() => handleDeleteQuestion(question)}
                                  onQuestionChange={(value: string) => {
                                    if (editedQuestion) {
                                      setEditedQuestion({ ...editedQuestion, question: value });
                                    }
                                  }}
                                  onOptionChange={(index: number, value: string) => {
                                    if (editedQuestion) {
                                      const newOptions = [...editedQuestion.options];
                                      newOptions[index] = value;
                                      setEditedQuestion({ ...editedQuestion, options: newOptions });
                                    }
                                  }}
                                  onCorrectAnswerChange={(index: number) => {
                                    if (editedQuestion) {
                                      setEditedQuestion({ ...editedQuestion, correct_answer: index });
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-xl w-full p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                Delete Category
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete the category <span className="font-semibold text-black dark:text-zinc-50">{categoryToDelete.name}</span>?<br />This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelDeleteCategory}
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 dark:bg-red-500 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-xl w-full p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                Delete Course
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete the course <span className="font-semibold text-black dark:text-zinc-50">{courseToDelete.name}</span>?<br />This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelDeleteCourse}
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourse}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 dark:bg-red-500 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => {
            setSelectedItem(null);
            setIsEditingItem(false);
            setEditedItem({});
          }}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
                Item Details
              </h2>
              <div className="flex items-center gap-2">
                {!isEditingItem && (
                  <>
                    {selectedItem.item_type !== 'quiz' && (
                      <button
                        onClick={handleEditItem}
                        className="px-4 py-2 bg-black dark:bg-zinc-50 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium"
                      >
                        Edit Item
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(selectedItem)}
                      className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Delete Item
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsEditingItem(false);
                    setEditedItem({});
                  }}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Item Type:</span>
                <p className="text-black dark:text-zinc-50 capitalize">{selectedItem.item_type}</p>
              </div>

              {selectedItem.item_type === 'document' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={editedItem.document_title || ''}
                          onChange={(e) => updateEditedItemField('document_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description:</label>
                        <textarea
                          value={editedItem.document_description || ''}
                          onChange={(e) => updateEditedItemField('document_description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                        <input
                          type="text"
                          value={editedItem.document_url || ''}
                          onChange={(e) => updateEditedItemField('document_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.document_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.document_title}</p>
                        </div>
                      )}
                      {selectedItem.document_description && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Description:</span>
                          <p className="text-black dark:text-zinc-50 whitespace-pre-wrap">{selectedItem.document_description}</p>
                        </div>
                      )}
                      {selectedItem.document_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">URL:</span><br />
                          <a
                            href={selectedItem.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedItem.document_url}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedItem.item_type === 'link' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={editedItem.link_title || ''}
                          onChange={(e) => updateEditedItemField('link_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                        <input
                          type="text"
                          value={editedItem.link_url || ''}
                          onChange={(e) => updateEditedItemField('link_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.link_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.link_title}</p>
                        </div>
                      )}
                      {selectedItem.link_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">URL:</span><br />
                          <a
                            href={selectedItem.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedItem.link_url}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedItem.item_type === 'podcast' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={editedItem.podcast_title || ''}
                          onChange={(e) => updateEditedItemField('podcast_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                        <textarea
                          value={editedItem.podcast_url || ''}
                          onChange={(e) => updateEditedItemField('podcast_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.podcast_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.podcast_title}</p>
                        </div>
                      )}
                      {selectedItem.podcast_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">URL:</span><br />
                          <div 
                            className="text-black dark:text-zinc-50"
                            dangerouslySetInnerHTML={{ __html: selectedItem.podcast_url }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedItem.item_type === 'quiz' && (
                <>
                  {isEditingItem ? (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Quiz:</label>
                      <input
                        type="text"
                        value={editedItem.quiz || ''}
                        onChange={(e) => updateEditedItemField('quiz', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                      />
                    </div>
                  ) : (
                    selectedItem.quiz && (
                      <div>
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Quiz:</span>
                        <p className="text-black dark:text-zinc-50">{selectedItem.quiz}</p>
                      </div>
                    )
                  )}
                </>
              )}

              {selectedItem.item_type === 'text' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={editedItem.text_title || ''}
                          onChange={(e) => updateEditedItemField('text_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Content:</label>
                        <textarea
                          value={editedItem.text_content || ''}
                          onChange={(e) => updateEditedItemField('text_content', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={8}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.text_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.text_title}</p>
                        </div>
                      )}
                      {selectedItem.text_content && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Content:</span>
                          <div 
                            className="text-black dark:text-zinc-50"
                            dangerouslySetInnerHTML={{ __html: selectedItem.text_content }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedItem.item_type === 'video' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Title:</label>
                        <input
                          type="text"
                          value={editedItem.video_title || ''}
                          onChange={(e) => updateEditedItemField('video_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">URL:</label>
                        <input
                          type="text"
                          value={editedItem.video_url || ''}
                          onChange={(e) => updateEditedItemField('video_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Duration:</label>
                        <input
                          type="text"
                          value={editedItem.video_duration || ''}
                          onChange={(e) => updateEditedItemField('video_duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Description:</label>
                        <textarea
                          value={editedItem.video_description || ''}
                          onChange={(e) => updateEditedItemField('video_description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={4}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.video_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.video_title}</p>
                        </div>
                      )}
                      {selectedItem.video_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">URL:</span><br />
                          <a
                            href={selectedItem.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedItem.video_url}
                          </a>
                        </div>
                      )}
                      {selectedItem.video_duration && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Duration:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.video_duration}</p>
                        </div>
                      )}
                      {selectedItem.video_description && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Description:</span>
                          <p className="text-black dark:text-zinc-50 whitespace-pre-wrap">{selectedItem.video_description}</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {selectedItem.item_type === 'video_doc' && (
                <>
                  {isEditingItem ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Title:</label>
                        <input
                          type="text"
                          value={editedItem.video_title || ''}
                          onChange={(e) => updateEditedItemField('video_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video URL:</label>
                        <input
                          type="text"
                          value={editedItem.video_url || ''}
                          onChange={(e) => updateEditedItemField('video_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Duration:</label>
                        <input
                          type="text"
                          value={editedItem.video_duration || ''}
                          onChange={(e) => updateEditedItemField('video_duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Video Description:</label>
                        <textarea
                          value={editedItem.video_description || ''}
                          onChange={(e) => updateEditedItemField('video_description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document Title:</label>
                        <input
                          type="text"
                          value={editedItem.document_title || ''}
                          onChange={(e) => updateEditedItemField('document_title', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document Description:</label>
                        <textarea
                          value={editedItem.document_description || ''}
                          onChange={(e) => updateEditedItemField('document_description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                          rows={4}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Document URL:</label>
                        <input
                          type="text"
                          value={editedItem.document_url || ''}
                          onChange={(e) => updateEditedItemField('document_url', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-50"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedItem.video_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Video Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.video_title}</p>
                        </div>
                      )}
                      {selectedItem.video_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Video URL:</span><br />
                          <a
                            href={selectedItem.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedItem.video_url}
                          </a>
                        </div>
                      )}
                      {selectedItem.video_duration && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Video Duration:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.video_duration}</p>
                        </div>
                      )}
                      {selectedItem.video_description && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Video Description:</span>
                          <p className="text-black dark:text-zinc-50 whitespace-pre-wrap">{selectedItem.video_description}</p>
                        </div>
                      )}
                      {selectedItem.document_title && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Document Title:</span>
                          <p className="text-black dark:text-zinc-50">{selectedItem.document_title}</p>
                        </div>
                      )}
                      {selectedItem.document_description && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Document Description:</span>
                          <p className="text-black dark:text-zinc-50 whitespace-pre-wrap">{selectedItem.document_description}</p>
                        </div>
                      )}
                      {selectedItem.document_url && (
                        <div>
                          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Document URL:</span><br />
                          <a
                            href={selectedItem.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            {selectedItem.document_url}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              {isEditingItem ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveItem}
                    className="flex-1 py-2 px-4 rounded-lg bg-black dark:bg-zinc-50 text-white dark:text-black font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEditItem}
                    className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setIsEditingItem(false);
                    setEditedItem({});
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-xl w-full p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                Delete Item
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete the item <span className="font-semibold text-black dark:text-zinc-50">{itemToDelete.name}</span>?<br />This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelDeleteItem}
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 dark:bg-red-500 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-xl w-full p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                Delete Question
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete this question?<br />
                <span className="font-semibold text-black dark:text-zinc-50">{questionToDelete.question}</span><br />
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelDeleteQuestion}
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuestion}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 dark:bg-red-500 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-xl w-full p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-2">
                Delete Quiz
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete the quiz <span className="font-semibold text-black dark:text-zinc-50">{quizToDelete.name}</span>?<br />
                This will also delete all associated questions.<br />
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={cancelDeleteQuiz}
                className="flex-1 py-2 px-4 rounded-lg border border-zinc-300 dark:border-zinc-700 text-black dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuiz}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 dark:bg-red-500 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

