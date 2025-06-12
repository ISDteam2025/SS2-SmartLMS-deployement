// src/components/course/CourseDetail.js - Optimized version using custom hooks
import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import EnrolledStudentList from './EnrolledStudentList';
import CourseStatistics from './CourseStatistics';
import DiscussionForum from './DiscussionForum';
import ModuleForm from './forms/ModuleForm';
import LessonContent from './LessonContent/LessonContent';
import AssignmentForm from './forms/AssignmentForm';
import QuizForm from './forms/QuizForm';
import EnrollmentModal from './modals/EnrollmentModal';
import VideoPlayer from './VideoPlayer';
import { useCourseData } from '../../hook/useCourse';
import notification from '../../utils/notification';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth } = useContext(AuthContext);

  // Use our custom hook for all course data
  const {
    course,
    modules,
    assignments,
    quizzes,
    discussions,
    enrollment,
    students,
    statistics,
    isLoading,
    hasError
  } = useCourseData(courseId);

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // Editing states
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);

  // Handle URL parameters for tab and discussion navigation
  const discussionId = searchParams.get('discussionId');
  const tabFromUrl = searchParams.get('tab');

  // Effect to handle URL parameters on component mount
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Auto-select first module and lesson when data loads
  React.useEffect(() => {
    if (modules.modules.length > 0 && !selectedModule) {
      const firstModule = modules.modules[0];
      setSelectedModule(firstModule.id);

      if (firstModule.lessons?.length > 0) {
        setSelectedLesson(firstModule.lessons[0].id);
      }
    }
  }, [modules.modules, selectedModule]);

  // User permissions
  const permissions = {
    canEdit: auth.user.role === 'admin' ||
      (auth.user.role === 'instructor' && course.course?.instructorId === auth.user.id),
    canEnroll: auth.user.role === 'student' && !enrollment.isEnrolled,
    canViewStudents: auth.user.role === 'admin' ||
      (auth.user.role === 'instructor' && course.course?.instructorId === auth.user.id),
    isEnrolled: enrollment.isEnrolled
  };

  // Get current lesson content
  const getCurrentLesson = () => {
    if (!selectedModule || !selectedLesson || !modules.modules.length) return null;

    const module = modules.modules.find(m => m.id === selectedModule);
    if (!module?.lessons) return null;

    return module.lessons.find(l => l.id === selectedLesson);
  };  // Navigate to assignment or quiz
  const navigateToAssessment = (type, id) => {
    if (type === 'assignment') {
      navigate(`/assignments/${id}`);
    } else if (type === 'quiz') {
      navigate(`/quizzes/${id}`, { state: { courseId } });
    }
  };

  // Download lesson material
  const downloadMaterial = async (materialId, fileName) => {
    try {
      const response = await fetch(`/api/uploads/download/material/${materialId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'lesson-material';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      notification.error('Failed to download material');
    }
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading course details...</div>;
  }

  if (hasError || !course.course) {
    return <div className="error-message">Course not found or access denied</div>;
  }

  return (
    <div className="course-detail-container">
      <Sidebar activeItem="courses" />

      <div className="admin-main-content">
        <Header title={course.course.title} />

        <div className="course-detail-content">
          {/* Course Header */}
          <div className="course-header">
            <div className="course-info">
              <h1>{course.course.title}</h1>              <div className="course-meta">
                <span className="course-code">{course.course.code}</span>
                <span className="course-instructor">Instructor: {course.course.instructor}</span>
                <span className={`status-badge ${course.course.status?.toLowerCase() || 'draft'}`}>
                  {course.course.status || 'Draft'}
                </span>
                {permissions.isEnrolled && (
                  <span className="enrolled-badge">Enrolled</span>
                )}
              </div>
              <p className="course-description">{course.course.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="main-actions">
              {permissions.canEdit && (
                <>
                  <button
                    className="primary-btn"
                    onClick={() => setShowModuleModal(true)}
                  >
                    <span className="btn-icon">📚</span> Add Module
                  </button>                  <button
                    className="secondary-btn"
                    onClick={() => {
                      if (modules.modules.length === 0) {
                        notification.warning('Create a module first');
                        return;
                      }
                      setIsCreatingLesson(true);
                    }}
                  >
                    <span className="btn-icon">📄</span> Add Lesson
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => setShowAssignmentModal(true)}
                  >
                    <span className="btn-icon">📝</span> Add Assignment
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => setShowQuizModal(true)}
                  >
                    <span className="btn-icon">🧩</span> Add Quiz
                  </button>
                </>
              )}

              {permissions.canEnroll && (
                <button
                  className="enroll-btn"
                  onClick={() => setShowEnrollModal(true)}
                >
                  <span className="btn-icon">✅</span> Enroll in Course
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="course-tabs">
            <button
              className={`course-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Course Content
            </button>

            {permissions.canViewStudents && (
              <button
                className={`course-tab ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
              >
                Students ({students.students.length})
              </button>
            )}

            {permissions.canViewStudents && (
              <button
                className={`course-tab ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                Statistics
              </button>
            )}

            <button
              className={`course-tab ${activeTab === 'discussion' ? 'active' : ''}`}
              onClick={() => setActiveTab('discussion')}
            >
              Discussion ({discussions.discussions.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'content' && (
            <div className="course-content-container">
              {/* Module Sidebar */}
              <div className="course-lessons-sidebar">
                <h3>Course Modules</h3>
                {modules.modules.length > 0 ? (
                  <ul className="lesson-list">
                    {modules.modules.map(module => (
                      <li
                        key={module.id}
                        className={selectedModule === module.id ? 'active' : ''}
                      >
                        <div
                          className="lesson-header"
                          onClick={() => setSelectedModule(module.id)}
                        >
                          <span className="lesson-title">{module.title}</span>
                          <span className="session-count">
                            {module.lessons?.length || 0} lessons
                          </span>
                        </div>

                        {selectedModule === module.id && module.lessons && (
                          <ul className="session-list">
                            {module.lessons.map(lesson => (
                              <li
                                key={lesson.id}
                                className={selectedLesson === lesson.id ? 'active' : ''}
                                onClick={() => setSelectedLesson(lesson.id)}
                              >                                <span className="session-icon">
                                  {lesson.contentType === 'quiz' ? '🧩' :
                                    lesson.contentType === 'assignment' ? '📝' :
                                      lesson.contentType === 'live_session' ? '🎪' : '📚'}
                                </span>
                                {lesson.title}
                              </li>
                            ))}                            {/* Show assignments for this module */}
                            {assignments.assignments
                              .filter(a => a.lesson_id === module.id)
                              .map(assignment => (
                                <li
                                  key={`assignment-${assignment.id}`}
                                  className="assessment-item assignment-item"
                                  onClick={() => navigateToAssessment('assignment', assignment.id)}
                                >
                                  <span className="session-icon">📋</span>
                                  Assignment: {assignment.title}
                                  {assignment.submission && (
                                    <span className="submission-status">
                                      {assignment.submission.isGraded ? '✅' : '📤'}
                                    </span>
                                  )}
                                </li>
                              ))
                            }                            {/* Show quizzes for this module */}
                            {quizzes.quizzes && quizzes.quizzes
                              .filter(q => {
                                // First try: filter by lessonId if it exists (NestJS uses camelCase)
                                if (q.lessonId && module.lessons && module.lessons.some(l => l.id === q.lessonId)) {
                                  return true;
                                }

                                // Second try: for quizzes without specific lesson, show in first module
                                if (!q.lessonId && module.id === modules.modules[0]?.id) {
                                  return true;
                                }

                                return false;
                              })
                              .map(quiz => (
                                <li
                                  key={`quiz-${quiz.id}`}
                                  className="assessment-item quiz-item"
                                  onClick={() => navigateToAssessment('quiz', quiz.id)}
                                >                                  <span className="session-icon">🧩</span>
                                  Quiz: {quiz.title}
                                  {quiz.attempts > 0 ? (
                                    <span className="quiz-status">
                                      {quiz.highestScore ? (
                                        <>
                                          {quiz.highestScore >= quiz.passingScore ? '✅' : '❌'}
                                          <span className="quiz-score">
                                            Best: {quiz.highestScore}%
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          📝
                                          <span className="quiz-attempts">
                                            {quiz.attempts} attempt{quiz.attempts > 1 ? 's' : ''}
                                          </span>
                                        </>
                                      )}
                                    </span>
                                  ) : quiz.canTake === false ? (
                                    <span className="quiz-status">
                                      🔒
                                      <span className="quiz-unavailable">Unavailable</span>
                                    </span>
                                  ) : (
                                    <span className="quiz-status">
                                      ⭕
                                      <span className="quiz-not-started">Not Started</span>
                                    </span>
                                  )}
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state">
                    <p>No modules created yet.</p>
                    {permissions.canEdit && (
                      <button
                        className="add-btn"
                        onClick={() => setShowModuleModal(true)}
                      >
                        Create First Module
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="course-session-content">
                {(() => {
                  const currentLesson = getCurrentLesson();

                  if (!currentLesson) {
                    return (
                      <div className="empty-state">
                        <p>Select a lesson to view content</p>                        {permissions.canEdit && modules.modules.length > 0 && (
                          <button
                            className="add-btn"
                            onClick={() => setIsCreatingLesson(true)}
                          >
                            Add First Lesson
                          </button>
                        )}
                      </div>
                    );
                  } return (
                    <div className="session-content">
                      <LessonContent
                        lesson={currentLesson}
                        selectedModule={selectedModule}
                        isInstructor={permissions.canEdit}
                        onLessonUpdate={modules.refetch}
                        isCreatingLesson={isCreatingLesson}
                        onLessonCreated={() => {
                          setIsCreatingLesson(false);
                          modules.refetch();
                        }}
                        onCancelCreate={() => setIsCreatingLesson(false)}
                        modules={modules.modules}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Other tabs */}
          {activeTab === 'students' && permissions.canViewStudents && (
            <EnrolledStudentList courseId={courseId} auth={auth} />
          )}

          {activeTab === 'statistics' && permissions.canViewStudents && (
            <CourseStatistics courseId={courseId} auth={auth} />
          )}          {activeTab === 'discussion' && (
            <DiscussionForum courseId={courseId} selectedDiscussionId={discussionId} />
          )}
        </div>
      </div>      {/* Modals */}
      {showModuleModal && (
        <ModuleForm
          onClose={() => setShowModuleModal(false)}
          onSubmit={modules.createModule}
        />
      )}

      {showAssignmentModal && (
        <AssignmentForm
          courseId={courseId}
          modules={modules.modules}
          onClose={() => setShowAssignmentModal(false)}
          onSubmit={assignments.createAssignment}
        />
      )}

      {showQuizModal && (
        <QuizForm
          courseId={courseId}
          modules={modules.modules}
          onClose={() => setShowQuizModal(false)}
          onSubmit={quizzes.createQuiz}
        />
      )}

      {showEnrollModal && (
        <EnrollmentModal
          onClose={() => setShowEnrollModal(false)}
          onEnroll={enrollment.enrollInCourse}
        />
      )}
    </div>
  );
};

export default CourseDetail;