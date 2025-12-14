'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Input, Typography } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';
import AppScrollbar from '../AppScrollBar';
import { debounce } from 'lodash';

const { TextArea } = Input;
const { Text } = Typography;

const MAX_CHARS = 5000;
const DEBOUNCE_DELAY = 2000;

const NotesButton = ({ notes }: { notes: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [noteContent, setNoteContent] = useState(notes);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef({
    current: notes,
    lastSaved: notes
  });
  
  // Initialize content ref
  useEffect(() => {
    contentRef.current = { current: notes, lastSaved: notes };
  }, [notes]);

  // Handle outside clicks and cleanup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
      saveNow();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      saveNow();
    };
  }, []);

  // Save to backend
  const saveNow = useCallback(async() => {
    const { current, lastSaved } = contentRef.current;
    if (current !== lastSaved) {
      contentRef.current.lastSaved = current;
    }
  }, []);

  // Create a debounced version of saveNow using lodash
  const debouncedSave = useCallback(debounce(saveNow, DEBOUNCE_DELAY), [saveNow]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value.slice(0, MAX_CHARS);
    setNoteContent(content);
    contentRef.current.current = content;
    debouncedSave();
  }, [debouncedSave]);

  // Toggle notes panel
  const toggleNotes = useCallback(() => setIsOpen(prev => !prev), []);

  // Close panel and save
  const closePanel = useCallback(() => {
    setIsOpen(false);
    saveNow();
  }, [saveNow]);

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-16 left-0 w-96 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="px-5 py-4 border-b border-border-header dark:border-dark-border flex items-center justify-between">
              <Text className="font-semibold text-lg">My Notes</Text>
              <Button
                size="small"
                shape='circle'
                type='text'
                danger
                icon={<X size={14} />}
                onClick={closePanel}
              />
            </div>

            <AppScrollbar className='max-h-[calc(100vh-250px)]'>
              <TextArea
                value={noteContent}
                onChange={handleContentChange}
                placeholder="Add your notes here..."
                autoSize={{ minRows: 10, maxRows: 30 }}
                className="!outline-0 !border-0 overflow-auto !bg-transparent"
                style={{ scrollbarWidth: "none",borderRadius:0 }}
              />
            </AppScrollbar>

            <div className="flex justify-between items-center px-4 py-2 border-t border-border-header dark:border-dark-border">
              <Text type="secondary" className="text-xs text-gray-500 dark:text-gray-400">
                {noteContent.length}/{MAX_CHARS} characters
              </Text>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="text"
        variant="solid"
        onClick={toggleNotes}
        icon={<FileText className="w-4 h-4" />}
      >
        <span>Notes</span>
      </Button>

    </div>
  );
};

export default React.memo(NotesButton);