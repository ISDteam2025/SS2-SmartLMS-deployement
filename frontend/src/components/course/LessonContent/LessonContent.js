// Inline Lesson Content Component - View and Edit Mode
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    MdDescription,
    MdImage,
    MdFolder,
    MdQuiz,
    MdLink,
    MdClose,
    MdEdit,
    MdSave,
    MdCancel,
    MdContentCopy,
    MdAdd,
    MdAttachFile
} from 'react-icons/md';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import courseService from '../../../services/courseService';
import notification from '../../../utils/notification';
import VideoPlayer from '../VideoPlayer';

// Content Block Components
import TextBlock from '../LessonBuilder/blocks/TextBlock';
import ImageBlock from '../LessonBuilder/blocks/ImageBlock';
import FileBlock from '../LessonBuilder/blocks/FileBlock';
import QuizBlock from '../LessonBuilder/blocks/QuizBlock';
import EmbedBlock from '../LessonBuilder/blocks/EmbedBlock';

import './LessonContent.css';

// Sortable Item Component for drag and drop
const SortableItem = ({ id, children }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`content-block-wrapper ${isDragging ? 'is-dragging' : ''}`}
        >
            {/* Drag Handle */}
            <div
                className="drag-handle"
                {...listeners}
                title="Drag to reorder"
            >
                ⋮⋮
            </div>
            {children}
        </div>
    );
};

const LessonContent = ({
    lesson,
    selectedModule,
    isInstructor,
    onLessonUpdate
}) => {
    const { courseId } = useParams(); const [isEditing, setIsEditing] = useState(false);
    const [contentBlocks, setContentBlocks] = useState([]);
    const [editingBlock, setEditingBlock] = useState(null);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );    // Available block types
    const blockTypes = [{ type: 'text', icon: <MdDescription />, label: 'Text Block', description: 'Add rich text content' },
    { type: 'image', icon: <MdImage />, label: 'Image', description: 'Upload or link images' },
    { type: 'file', icon: <MdFolder />, label: 'Files', description: 'Documents and downloads' },
    { type: 'quiz', icon: <MdQuiz />, label: 'Mini Quiz', description: 'Quick knowledge check' },
    { type: 'embed', icon: <MdLink />, label: 'Embed/Video', description: 'YouTube, video uploads (max 10MB), or any URL' }
    ];// Initialize content blocks from lesson
    useEffect(() => {
        if (lesson?.content) {
            try {
                // Try to parse as JSON (new format)
                const blocks = JSON.parse(lesson.content);

                // Migrate video blocks to embed blocks
                const migratedBlocks = Array.isArray(blocks) ? blocks.map(block => {
                    if (block.type === 'video') {
                        return {
                            ...block,
                            type: 'embed',
                            data: {
                                ...block.data,
                                height: 400,
                                allowFullscreen: true
                            }
                        };
                    }
                    return block;
                }) : [];

                setContentBlocks(migratedBlocks);
            } catch (error) {
                // If parsing fails, it's old format (plain text/HTML) - convert it
                console.log('Converting legacy content to block format');
                const legacyBlock = {
                    id: `legacy_${Date.now()}`,
                    type: 'text',
                    data: {
                        content: lesson.content,
                        style: 'paragraph'
                    },
                    order: 0
                };
                setContentBlocks([legacyBlock]);
            }
        } else {
            setContentBlocks([]);
        }
    }, [lesson]);

    // Handle drag and drop reordering
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setContentBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Get default data for block type
    const getDefaultBlockData = (type) => {
        switch (type) {
            case 'text':
                return { content: '', style: 'paragraph' };
            case 'image':
                return { url: '', alt: '', caption: '', alignment: 'center' };
            case 'file':
                return { files: [], description: '' };
            case 'quiz':
                return { question: '', options: ['', ''], correctAnswer: 0, explanation: '' };
            case 'embed':
                return { url: '', height: 400, title: '' };
            default:
                return {};
        }
    };

    // Add new content block
    const addBlock = (type) => {
        const newBlock = {
            id: `block_${Date.now()}`,
            type,
            data: getDefaultBlockData(type),
            order: contentBlocks.length
        };

        setContentBlocks([...contentBlocks, newBlock]);
        setShowAddMenu(false);
        setEditingBlock(newBlock.id);
    };

    // Update block data
    const updateBlock = (blockId, newData) => {
        setContentBlocks(contentBlocks.map(block =>
            block.id === blockId ? { ...block, data: { ...block.data, ...newData } } : block
        ));
    };

    // Delete block
    const deleteBlock = (blockId) => {
        setContentBlocks(contentBlocks.filter(block => block.id !== blockId));
        setEditingBlock(null);
    };

    // Duplicate block
    const duplicateBlock = (blockId) => {
        const blockToDuplicate = contentBlocks.find(block => block.id === blockId);
        if (blockToDuplicate) {
            const newBlock = {
                ...blockToDuplicate,
                id: `block_${Date.now()}`,
                order: contentBlocks.length
            };
            setContentBlocks([...contentBlocks, newBlock]);
        }
    };

    // Move block up/down
    const moveBlock = (blockId, direction) => {
        const currentIndex = contentBlocks.findIndex(block => block.id === blockId);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === contentBlocks.length - 1)
        ) {
            return;
        }

        const newBlocks = [...contentBlocks];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]];

        setContentBlocks(newBlocks);
    };    // Save lesson content
    const handleSaveContent = async () => {
        setIsSubmitting(true);

        try {
            const submitData = {
                title: lesson.title,
                description: lesson.description,
                moduleId: lesson.moduleId || selectedModule, // Use lesson's moduleId or fall back to selected module
                durationMinutes: lesson.durationMinutes,
                isPublished: lesson.isPublished,
                contentType: 'rich_content',
                content: JSON.stringify(contentBlocks.map((block, index) => ({ ...block, order: index })))
            };

            await courseService.updateLesson(courseId, lesson.id, submitData);
            setIsEditing(false);
            setEditingBlock(null);
            onLessonUpdate();
            notification.success('Lesson content updated successfully');
        } catch (error) {
            console.error('Error updating lesson:', error);
            notification.error('Failed to update lesson content');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        // Reset content blocks to original state
        if (lesson?.content) {
            try {
                const blocks = JSON.parse(lesson.content);
                setContentBlocks(Array.isArray(blocks) ? blocks : []);
            } catch (error) {
                setContentBlocks([]);
            }
        } else {
            setContentBlocks([]);
        } setIsEditing(false); setEditingBlock(null);
        setShowAddMenu(false);
    };

    // Render content block
    const renderBlock = (block, index, isEditMode = false) => {
        const isBlockEditing = isEditMode && editingBlock === block.id;

        const blockProps = {
            block,
            isEditing: isBlockEditing,
            onUpdate: (data) => updateBlock(block.id, data),
            onStartEdit: () => setEditingBlock(block.id),
            onStopEdit: () => setEditingBlock(null),
            onDelete: () => deleteBlock(block.id),
            onDuplicate: () => duplicateBlock(block.id),
            onMoveUp: () => moveBlock(block.id, 'up'),
            onMoveDown: () => moveBlock(block.id, 'down'),
            canMoveUp: index > 0,
            canMoveDown: index < contentBlocks.length - 1
        };

        // In view mode, render read-only version
        if (!isEditMode) {
            return (
                <div key={block.id} className="content-block-readonly">
                    {renderReadOnlyBlock(block)}
                </div>
            );
        }        // In edit mode, render editable blocks
        switch (block.type) {
            case 'text':
                return <TextBlock {...blockProps} />;
            case 'image':
                return <ImageBlock {...blockProps} />;
            case 'file':
                return <FileBlock {...blockProps} />;
            case 'quiz':
                return <QuizBlock {...blockProps} />;
            case 'embed':
                return <EmbedBlock {...blockProps} />;
            default:
                return <div>Unknown block type: {block.type}</div>;
        }
    };

    // Render read-only block for view mode
    const renderReadOnlyBlock = (block) => {
        switch (block.type) {
            case 'text':
                return (
                    <div className={`text-content text-${block.data.style}`}>
                        <div dangerouslySetInnerHTML={{ __html: block.data.content }} />
                    </div>
                ); case 'image':
                return (
                    <div className={`image-content align-${block.data.alignment}`}>
                        <img src={block.data.url} alt={block.data.alt} />
                        {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                    </div>
                );
            case 'file':
                return (
                    <div className="file-content">
                        {block.data.description && <p>{block.data.description}</p>}
                        <div className="files-list">
                            {block.data.files.map((file, index) => (
                                <a key={index} href={file.url} download className="file-download">
                                    <MdAttachFile /> {file.name}
                                </a>
                            ))}
                        </div>
                    </div>
                );
            case 'quiz':
                return (
                    <div className="quiz-content">
                        <h4>{block.data.question}</h4>
                        <div className="quiz-options">
                            {block.data.options.map((option, index) => (
                                <div key={index} className="quiz-option">
                                    <input type="radio" name={`quiz_${block.id}`} />
                                    <label>{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                ); case 'embed':
                return (
                    <div className="embed-content">
                        {block.data.title && <h4>{block.data.title}</h4>}
                        {renderEmbedReadOnly(block)}
                    </div>
                );
            default:
                return <div>Unknown content type</div>;
        }
    };

    // Helper function to render embed content in readonly mode
    const renderEmbedReadOnly = (block) => {
        if (!block.data.url) {
            return (
                <div className="embed-placeholder">
                    <div className="placeholder-icon"><MdLink /></div>
                    <p>No embed content available</p>
                </div>
            );
        }

        // Check if URL is a video URL that should use VideoPlayer
        const isVideoUrl = (url) => {
            if (!url) return false;

            const videoStreamingDomains = [
                'youtube.com',
                'youtu.be',
                'vimeo.com',
                'dailymotion.com'
            ];

            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

            const hasVideoExtension = videoExtensions.some(ext =>
                url.toLowerCase().includes(ext)
            );

            const isStreamingUrl = videoStreamingDomains.some(domain =>
                url.toLowerCase().includes(domain)
            );

            return hasVideoExtension || isStreamingUrl;
        };

        // Check if URL is a YouTube URL
        const isYouTubeUrl = (url) => {
            return url && (url.includes('youtube.com') || url.includes('youtu.be'));
        };

        // Convert YouTube URLs to embed format
        const convertToEmbedUrl = (url) => {
            if (!url) return url;

            // If it's already an embed URL, return as is
            if (url.includes('youtube.com/embed/')) {
                return url;
            }

            // Extract video ID and convert to embed URL
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/)([^#&?]*)/,
                /youtube\.com\/watch\?.*v=([^#&?]*)/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1] && match[1].length === 11) {
                    return `https://www.youtube.com/embed/${match[1]}`;
                }
            }

            return url; // Return original URL if not YouTube
        };

        // If it's a video URL, use VideoPlayer component
        if (isVideoUrl(block.data.url)) {
            return (
                <div className="video-wrapper">
                    <VideoPlayer
                        videoUrl={isYouTubeUrl(block.data.url) ? convertToEmbedUrl(block.data.url) : block.data.url}
                        title={block.data.title || 'Embedded Video'}
                        containerMode="fixed"
                    />
                </div>
            );
        }

        // For non-video content, use regular iframe
        return (
            <div className="embed-iframe-wrapper">
                <iframe
                    src={block.data.url}
                    height={block.data.height || '400px'}
                    width="100%"
                    frameBorder="0"
                    allowFullScreen={block.data.allowFullscreen}
                    className="embed-iframe"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        );
    }; return (
        <div className="lesson-content-container">
            {/* Regular lesson view/edit mode */}
            <div className="lesson-content-header">
                <div className="lesson-info">
                    <h2>{lesson.title}</h2>
                    <div className="lesson-meta">
                        <span className="duration">Duration: {lesson.durationMinutes || 0} minutes</span>
                        {lesson.description && (
                            <p className="lesson-description">{lesson.description}</p>
                        )}
                    </div>
                </div>

                {/* Edit Controls for Instructors */}
                {isInstructor && (
                    <div className="lesson-controls">
                        {!isEditing ? (
                            <button
                                className="edit-lesson-btn"
                                onClick={() => setIsEditing(true)}
                            >
                                <MdEdit /> Edit Lesson
                            </button>
                        ) : (
                            <div className="edit-controls">
                                <button
                                    className="save-btn"
                                    onClick={handleSaveContent}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <><MdSave /> Saving...</> : <><MdSave /> Save</>}
                                </button>
                                <button
                                    className="cancel-btn"
                                    onClick={handleCancelEdit}
                                >
                                    <MdCancel /> Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="lesson-content-body">
                {contentBlocks.length === 0 ? (
                    // Empty state
                    <div className="empty-lesson-content">
                        {isEditing ? (
                            <div className="empty-edit-state">
                                <div className="empty-icon"><MdContentCopy /></div>
                                <h3>Start Building Your Lesson</h3>
                                <p>Add content blocks to create an engaging lesson experience</p>
                                <button
                                    className="add-first-block-btn"
                                    onClick={() => setShowAddMenu(true)}
                                >
                                    + Add Your First Block
                                </button>
                            </div>
                        ) : (
                            <div className="empty-view-state">
                                <p>This lesson doesn't have any content yet.</p>
                                {isInstructor && (
                                    <button
                                        className="edit-lesson-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <MdAdd /> Add Content
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Content blocks
                    <div className="lesson-content-blocks">
                        {isEditing ? (
                            // Edit mode with drag and drop
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={contentBlocks.map(block => block.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="content-blocks-container">
                                        {contentBlocks.map((block, index) => (
                                            <SortableItem key={block.id} id={block.id}>
                                                {renderBlock(block, index, true)}
                                            </SortableItem>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        ) : (
                            // View mode
                            <div className="content-blocks-readonly">
                                {contentBlocks.map((block, index) =>
                                    renderBlock(block, index, false)
                                )}
                            </div>
                        )}

                        {/* Add Block Button in Edit Mode */}
                        {isEditing && (
                            <div className="add-block-section">
                                <button
                                    className="add-block-btn"
                                    onClick={() => setShowAddMenu(true)}
                                >
                                    + Add Content Block
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>            {/* Add Block Menu */}
            {isEditing && showAddMenu && (
                <div className="add-block-menu-overlay" onClick={() => setShowAddMenu(false)}>
                    <div className="add-block-menu" onClick={(e) => e.stopPropagation()}>
                        <div className="menu-header">
                            <h3>Add Content Block</h3>
                            <button onClick={() => setShowAddMenu(false)}><MdClose /></button>
                        </div>
                        <div className="block-types-grid">
                            {blockTypes.map(blockType => (
                                <div
                                    key={blockType.type}
                                    className="block-type-card"
                                    onClick={() => addBlock(blockType.type)}
                                >
                                    <div className="block-icon">{blockType.icon}</div>
                                    <div className="block-info">
                                        <h4>{blockType.label}</h4>
                                        <p>{blockType.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>)}
        </div>
    );
};

export default LessonContent;
