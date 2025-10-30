'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Item {
  uuid: string;
  item_type: string;
  video_title?: string;
  video_url?: string;
  video_description?: string;
  video_duration?: string;
  document_title?: string;
  document_url?: string;
  document_description?: string;
  text_title?: string;
  text_content?: string;
  quiz?: string;
  link_title?: string;
  link_url?: string;
  podcast_title?: string;
  podcast_url?: string;
  item_order?: number;
  lp_identifier?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  quiz_order: number;
}

interface Course {
  uuid: string;
  category: string;
  course_name: string;
  course_description: string;
  seq_order: number;
}

// Quiz component that displays questions one at a time
function QuizDisplay({ 
  quizName, 
  onCompletionChange 
}: { 
  quizName: string;
  onCompletionChange?: (isComplete: boolean, score: number) => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<Array<{ question: string; selected: number; correct: number; isCorrect: boolean }>>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Fetch quiz questions
    fetch(`/api/quiz-questions?quiz_name=${encodeURIComponent(quizName)}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          setQuestions(result.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching quiz questions:', error);
      });
  }, [quizName]);

  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return; // Prevent changing answer after submission
    
    setSelectedAnswer(index);
    const currentQuestion = questions[currentIndex];
    
    // Show feedback immediately
    setShowFeedback(true);
    const isCorrect = index === currentQuestion.correct_answer;
    
    // Add to answer history
    setAnswerHistory(prev => [...prev, {
      question: currentQuestion.question,
      selected: index,
      correct: currentQuestion.correct_answer,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswerHistory([]);
    setIsComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Loading quiz...
        </p>
      </div>
    );
  }

  // Calculate completion stats
  const finalCorrectCount = isComplete ? answerHistory.filter(a => a.isCorrect).length : 0;
  const percentage = isComplete && questions.length > 0 ? Math.round((finalCorrectCount / questions.length) * 100) : 0;
  const isPerfectScore = isComplete && percentage === 100;

  // Notify parent of completion state changes
  useEffect(() => {
    if (onCompletionChange && questions.length > 0) {
      onCompletionChange(isPerfectScore, percentage);
    }
  }, [isPerfectScore, percentage, onCompletionChange, questions.length]);

  if (isComplete) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-black dark:text-zinc-50 mb-6 text-center">
            Quiz Complete!
          </h2>
          
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
                {finalCorrectCount} / {questions.length}
              </p>
              <p className="text-2xl font-semibold text-zinc-600 dark:text-zinc-400">
                {percentage}%
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {questions.map((q, idx) => {
              const history = answerHistory[idx];
              const isCorrect = history.isCorrect;
              return (
                <div
                  key={q.id}
                  className={`border rounded-lg p-4 ${
                    isCorrect
                      ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <p className="font-medium mb-2 text-black dark:text-zinc-50">
                    {idx + 1}. {q.question}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your answer: {q.options[history.selected]}
                    {!isCorrect && (
                      <span className="block mt-1">
                        Correct answer: {q.options[history.correct]}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity font-medium"
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  // Calculate running stats
  const answeredCount = answerHistory.length;
  const correctCount = answerHistory.filter(a => a.isCorrect).length;
  const runningPercentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Running tally display */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="font-medium">
              {correctCount} correct / {answeredCount} answered ({runningPercentage}%)
            </span>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-6">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = "w-full text-left px-4 py-3 rounded-md border transition-all font-medium ";
            
            if (showFeedback) {
              if (index === currentQuestion.correct_answer) {
                buttonClass += "bg-green-500 text-white border-green-600 ";
              } else if (selectedAnswer === index) {
                buttonClass += "bg-red-500 text-white border-red-600 ";
              } else {
                buttonClass += "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 ";
              }
            } else {
              if (selectedAnswer === index) {
                buttonClass += "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white ";
              } else {
                buttonClass += "bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white ";
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showFeedback}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        {showFeedback && (
          <button
            onClick={handleNext}
            className="w-full px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity font-medium"
          >
            {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
          </button>
        )}
      </div>
    </div>
  );
}

// VideoPlayer component that prevents seeking/forwarding based on category
function VideoPlayer({ 
  src, 
  preventFastForward,
  onVideoEnded 
}: { 
  src: string; 
  preventFastForward: boolean;
  onVideoEnded?: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!preventFastForward) return; // Allow seeking if not prevented
    
    const video = e.currentTarget;
    setCurrentTime(video.currentTime);
    
    // Prevent user from seeking ahead
    // Only allow seeking backward (reviewing material)
    if (video.currentTime > currentTime + 1) {
      // User tried to seek forward, reset to previous time
      video.currentTime = currentTime;
    }
  };

  const handleEnded = () => {
    if (onVideoEnded) {
      onVideoEnded();
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
      controls
      autoPlay
      playsInline
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
    />
  );
}

export default function ItemDetailPage() {
  const [item, setItem] = useState<Item | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [videoEnded, setVideoEnded] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const params = useParams();
  const categoryUuid = params.category as string;
  const courseUuid = params.course as string;
  const itemUuid = params.item as string;

  // Fetch email on mount
  useEffect(() => {
    fetch('/api/get-email')
      .then((res) => res.json())
      .then((data) => {
        if (data.email) {
          setEmail(data.email);
        }
      })
      .catch(() => {
        // Silent fail - email is optional
      });
  }, []);

  // Check if this is Leadership Pipeline category and item has lp_identifier
  const isLeadershipPipeline = course?.category === 'Leadership Pipeline';
  const hasLpIdentifier = item?.lp_identifier && item.lp_identifier.trim() !== '';

  // Fetch completion status when email and item change
  useEffect(() => {
    if (email && hasLpIdentifier && isLeadershipPipeline) {
      fetch(`/api/lp/completion?email=${encodeURIComponent(email)}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.data && item?.lp_identifier) {
            const completionStatus = result.data[item.lp_identifier];
            setIsCompleted(completionStatus === true);
          }
        })
        .catch(() => {
          // Silent fail
        });
    } else {
      setIsCompleted(false);
    }
  }, [email, item?.lp_identifier, isLeadershipPipeline]);

  // Reset completion states when item changes
  useEffect(() => {
    setVideoEnded(false);
    setQuizComplete(false);
  }, [itemUuid]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleQuizCompletionChange = (isComplete: boolean, score: number) => {
    setQuizComplete(isComplete && score === 100);
  };

  const handleMarkComplete = async () => {
    if (!email || !item?.lp_identifier || markingComplete) return;

    setMarkingComplete(true);
    try {
      const response = await fetch('/api/lp/mark-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          lp_identifier: item.lp_identifier,
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        // Dispatch custom event to notify layout to refresh completion status
        window.dispatchEvent(new CustomEvent('lp-completion-updated', { 
          detail: { email, lp_identifier: item.lp_identifier } 
        }));
      } else {
        const error = await response.json();
        console.error('Error marking complete:', error);
        alert('Failed to mark completion. Please try again.');
      }
    } catch (error) {
      console.error('Error marking complete:', error);
      alert('Failed to mark completion. Please try again.');
    } finally {
      setMarkingComplete(false);
    }
  };

  // Mark Completion Button Component
  const MarkCompletionButton = () => {
    if (!isLeadershipPipeline || !hasLpIdentifier || !email) {
      return null;
    }

    const canMarkComplete = (item?.item_type === 'video' && videoEnded) || 
                           (item?.item_type === 'quiz' && quizComplete);
    const isDisabled = isCompleted || !canMarkComplete || markingComplete;

    return (
      <div className="mt-6">
        <button
          onClick={handleMarkComplete}
          disabled={isDisabled}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-opacity ${
            isCompleted
              ? 'bg-green-500 dark:bg-green-600 text-white dark:text-white cursor-not-allowed opacity-75'
              : isDisabled
              ? 'bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 cursor-not-allowed'
              : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
          }`}
        >
          {isCompleted ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Completed
            </>
          ) : (
            <>
              {markingComplete ? 'Marking...' : 'Mark Completion'}
            </>
          )}
        </button>
      </div>
    );
  };

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
            const foundCourse = courses.find((c: Course) => c.uuid === courseUuid);
            if (foundCourse) {
              setCourse(foundCourse);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching course data:', error);
        });
    }
  }, [categoryUuid, courseUuid]);

  useEffect(() => {
    // Fetch items for this course to find the specific item
    fetch(`/api/items?course_uuid=${encodeURIComponent(courseUuid)}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.data) {
          const foundItem = result.data.find((i: Item) => i.uuid === itemUuid);
          if (foundItem) {
            setItem(foundItem);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching items:', error);
        setLoading(false);
      });
  }, [courseUuid, itemUuid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Loading...
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-zinc-500 dark:text-zinc-400 text-center">
          Item not found
        </p>
      </div>
    );
  }

  // Render based on item type
  const renderItem = () => {
    const toYoutubeEmbedUrl = (url: string) => {
      try {
        // Handle various YouTube URL formats
        const urlObj = new URL(url);
        
        // youtube.com/watch?v=VIDEO_ID format
        if (url.includes('youtube.com/watch')) {
          const videoId = urlObj.searchParams.get('v');
          return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        
        // youtu.be/VIDEO_ID format
        if (url.includes('youtu.be/')) {
          const videoId = urlObj.pathname.split('/')[1];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        
        // youtube.com/embed/VIDEO_ID (already an embed URL)
        if (url.includes('youtube.com/embed')) {
          return url;
        }
        
        return url;
      } catch {
        return url;
      }
    };

    const toDropboxRawUrl = (inputUrl: string) => {
      try {
        const url = new URL(inputUrl);
        if (url.hostname.includes('dropbox.com')) {
          // Ensure a direct file response suitable for the <video> tag
          url.searchParams.set('raw', '1');
        }
        return url.toString();
      } catch {
        return inputUrl;
      }
    };

    const toDropboxDirectUrl = (inputUrl: string) => {
      try {
        const url = new URL(inputUrl);
        if (url.hostname.includes('dropbox.com')) {
          // Convert Dropbox share link to direct download link
          url.searchParams.set('dl', '1');
        }
        return url.toString();
      } catch {
        return inputUrl;
      }
    };

    const toDropboxViewUrl = (inputUrl: string) => {
      try {
        // Convert Dropbox share link to direct URL for viewing
        if (inputUrl.includes('dropbox.com')) {
          return inputUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
                        .replace('?dl=0', '')
                        .replace('?dl=1', '')
                        .split('?')[0];
        }
        return inputUrl;
      } catch {
        return inputUrl;
      }
    };

    switch (item.item_type) {
      case 'video':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.video_title || 'Video'}
            </h2>
            {item.video_description && (
              <div className="mt-4 mb-6">
                <p className="text-base text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {item.video_description}
                </p>
              </div>
            )}
            {item.video_url && (
              <div className="mt-6">
                {
                  // Check if it's a Vimeo URL
                  item.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={item.video_url.replace(/vimeo\.com\/(\d+)\/?(.*)/, 'player.vimeo.com/video/$1?h=$2')}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : 
                  // Check if it's a YouTube URL
                  (item.video_url.includes('youtube.com') || item.video_url.includes('youtu.be')) ? (
                    <iframe
                      src={toYoutubeEmbedUrl(item.video_url)}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) :
                  // Check if it's a Dropbox link
                  item.video_url.includes('dropbox.com') ? (
                    <VideoPlayer
                      src={toDropboxRawUrl(item.video_url)}
                      preventFastForward={course?.category === 'Leadership Pipeline'}
                      onVideoEnded={handleVideoEnded}
                    />
                  ) : (
                    // Assume it's any other video URL
                    <iframe
                      src={item.video_url}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
              </div>
            )}
            {item.video_duration && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                Duration: {item.video_duration}
              </p>
            )}
            <MarkCompletionButton />
          </div>
        );

      case 'document':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.document_title || 'Document'}
            </h2>
            {item.document_description && (
              <div className="mt-4 mb-6">
                <p className="text-base text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {item.document_description}
                </p>
              </div>
            )}
            {item.document_url && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (!item.document_url) return;
                    const link = document.createElement('a');
                    link.href = toDropboxDirectUrl(item.document_url);
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                >
                  Download PDF
                </button>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.text_title || 'Text Content'}
            </h2>
            {item.text_content && (
              <div 
                className="mt-4 text-base text-zinc-600 dark:text-zinc-400 prose prose-zinc dark:prose-invert max-w-none space-y-4"
                dangerouslySetInnerHTML={{ __html: item.text_content }}
              />
            )}
          </div>
        );

      case 'video_doc':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.video_title || 'Video Document'}
            </h2>
            {item.document_description && (
              <div className="mt-4 mb-6">
                <p className="text-base text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                  {item.document_description}
                </p>
              </div>
            )}
            {item.document_url && (
              <div className="mt-6 mb-8">
                <button
                  onClick={() => {
                    if (!item.document_url) return;
                    const link = document.createElement('a');
                    link.href = toDropboxDirectUrl(item.document_url);
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity"
                >
                  Download PDF
                </button>
              </div>
            )}
            {item.video_url && (
              <div className="mt-6">
                {
                  // Check if it's a Vimeo URL
                  item.video_url.includes('vimeo.com') ? (
                    <iframe
                      src={item.video_url.replace(/vimeo\.com\/(\d+)\/?(.*)/, 'player.vimeo.com/video/$1?h=$2')}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : 
                  // Check if it's a YouTube URL
                  (item.video_url.includes('youtube.com') || item.video_url.includes('youtu.be')) ? (
                    <iframe
                      src={toYoutubeEmbedUrl(item.video_url)}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) :
                  // Check if it's a Dropbox link
                  item.video_url.includes('dropbox.com') ? (
                    <VideoPlayer
                      src={toDropboxRawUrl(item.video_url)}
                      preventFastForward={course?.category === 'Leadership Pipeline'}
                      onVideoEnded={handleVideoEnded}
                    />
                  ) : (
                    // Assume it's any other video URL
                    <iframe
                      src={item.video_url}
                      className="w-full aspect-video rounded-lg border border-zinc-200 dark:border-zinc-800"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
              </div>
            )}
            {item.video_duration && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
                Duration: {item.video_duration}
              </p>
            )}
            <MarkCompletionButton />
          </div>
        );

      case 'quiz':
        return (
          <>
            {item.quiz && (
              <div className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                <h2 className="text-2xl font-bold text-black dark:text-zinc-50">
                  Quiz: {item.quiz}
                </h2>
              </div>
            )}
            <QuizDisplay 
              quizName={item.quiz || ''} 
              onCompletionChange={handleQuizCompletionChange}
            />
            <div className="px-8 pb-8">
              <MarkCompletionButton />
            </div>
          </>
        );

      case 'link':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.link_title || 'Link'}
            </h2>
            {item.link_url && (
              <div className="mt-6">
                <a
                  href={item.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-80 transition-opacity font-medium"
                >
                  Open Link
                </a>
              </div>
            )}
          </div>
        );

      case 'podcast':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-black dark:text-zinc-50 mb-4">
              {item.podcast_title || 'Podcast'}
            </h2>
            {item.podcast_url && (
              <div 
                className="mt-6"
                dangerouslySetInnerHTML={{ __html: item.podcast_url }}
              />
            )}
          </div>
        );

      default:
        return (
          <div className="p-8">
            <p className="text-zinc-500 dark:text-zinc-400">
              Unknown item type
            </p>
          </div>
        );
    }
  };

  return renderItem();
}

