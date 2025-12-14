'use client';
import { toast } from '@/components/AppToaster/AppToaster';
import InputBox from '@/components/Input/Input';
import Label from '@/components/Label/Label';
import ModalWrapper from '@/components/Modal/Modal';
import { Button, Input, Modal } from 'antd';
import dayjs from 'dayjs';
import { Field, Form, Formik } from 'formik';
import { Calendar, Edit, NotebookIcon, Plus, Search, Trash2, User } from 'lucide-react';
import { useState, useMemo, useCallback, memo } from 'react';
import * as Yup from 'yup';
import { useDealStore } from '../../../../../context/store/dealsStore';
import AppScrollbar from '@/components/AppScrollBar';

// Memoized note item component to prevent unnecessary re-renders
const NoteItem = memo(({ note, onEdit, onDelete }: {
  note: any;
  onEdit: (note: any) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700">
    <div className="p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 dark:text-white text-lg pr-2">{note.title}</h4>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex items-center mr-4">
              <User size={14} className="mr-1.5" />
              <span>{note.createdBy}</span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5" />
              <span>{dayjs(note.createdAt).format('MMM D, YYYY')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => onEdit(note)}
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
            aria-label="Edit note"
          />
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            onClick={() => onDelete(note.id)}
            className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
            aria-label="Delete note"
          />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {note.description}
        </p>
      </div>
    </div>
  </div>
));

NoteItem.displayName = 'NoteItem';

// Memoized empty state component
const EmptyState = memo(({ searchTerm, onAddNote, setSearchTerm }: {
  searchTerm: string;
  onAddNote: () => void;
  setSearchTerm: (searchTerm: string) => void;
}) => {
  const isSearchState = Boolean(searchTerm);
  
  return (
    <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl transition-all duration-300">
      <div className="flex flex-col items-center justify-center">
        <div className={`transition-all duration-300 ${isSearchState ? 'scale-90 opacity-70' : 'scale-100 opacity-100'}`}>
          {isSearchState ? (
            <div className="relative">
              <Search className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl opacity-30"></div>
            </div>
          ) : (
            <div className="relative">
              <NotebookIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl opacity-30"></div>
            </div>
          )}
        </div>
        
        <div className="mt-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {isSearchState ? 'No Results Found' : 'No Notes Yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {isSearchState 
              ? `We couldn't find any notes matching "${searchTerm}".`
              : 'Start by creating your first note.'
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {isSearchState ? (
            <Button
              type="default"
              onClick={() => setSearchTerm('')}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Clear Search
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={onAddNote}
              className="h-10 px-5 rounded-md shadow-sm hover:shadow-md transition-all duration-200"
            >
              Add First Note
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

// Memoized delete confirmation modal
const DeleteModal = memo(({
  isVisible,
  onCancel,
  onConfirm
}: {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Modal
    title={
      <div className="flex items-center gap-2">
        <Trash2 size={18} className="text-red-500" />
        <span>Delete Note</span>
      </div>
    }
    open={isVisible}
    onCancel={onCancel}
    footer={
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="primary"
          danger
          onClick={onConfirm}
        >
          Delete
        </Button>
      </div>
    }
    width={450}
    destroyOnHidden
    maskClosable={false}
  >
    <div className="py-4">
      <p className="text-gray-700 dark:text-gray-300">
        Are you sure you want to delete this note? This action cannot be undone.
      </p>
    </div>
  </Modal>
));

DeleteModal.displayName = 'DeleteModal';

// Main component
const NoteModal = () => {
  const { notes, addNote, updateNote, deleteNote } = useDealStore();

  // Combine modal states into a single object
  const [modals, setModals] = useState({
    note: false,
    delete: false
  });

  const [editingNote, setEditingNote] = useState<any>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize validation schema to prevent recreation on every render
  const validationSchema = useMemo(() => Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required')
  }), []);

  // Memoize filtered notes
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      note.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      note.createdBy.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [notes, searchTerm]);

  // Memoize initial values
  const initialValues = useMemo(() => ({
    title: editingNote ? editingNote.title : '',
    description: editingNote ? editingNote.description : ''
  }), [editingNote]);

  // Memoize modal close handler
  const onClose = useCallback(() => {
    setModals(prev => ({ ...prev, note: false }));
    setEditingNote(null);
  }, []);

  // Memoize add note handler
  const handleAddNote = useCallback(() => {
    setEditingNote(null);
    setModals(prev => ({ ...prev, note: true }));
  }, []);

  // Memoize edit note handler
  const handleEditNote = useCallback((note: any) => {
    setEditingNote(note);
    setModals(prev => ({ ...prev, note: true }));
  }, []);

  // Memoize delete note handler
  const handleDeleteNote = useCallback((noteId: number) => {
    setDeletingNoteId(noteId);
    setModals(prev => ({ ...prev, delete: true }));
  }, []);

  // Memoize confirm delete handler
  const confirmDelete = useCallback(() => {
    if (deletingNoteId) {
      deleteNote(deletingNoteId);
      setModals(prev => ({ ...prev, delete: false }));
      setDeletingNoteId(null);
      toast.success('Note deleted successfully');
    }
  }, [deletingNoteId, deleteNote]);

  // Memoize form submit handler
  const handleSubmit = useCallback((values: any) => {
    if (editingNote) {
      updateNote(editingNote.id, values);
      toast.success('Note updated successfully');
    } else {
      addNote(values);
      toast.success('Note added successfully');
    }
    onClose();
  }, [editingNote, updateNote, addNote, onClose]);

  // Memoize cancel delete handler
  const cancelDelete = useCallback(() => {
    setModals(prev => ({ ...prev, delete: false }));
  }, []);

  return (
    <>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-0">Notes</h3>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAddNote}
            className="flex items-center gap-1 h-10 px-4 rounded-md shadow-sm"
          >
            Add Note
          </Button>
        </div>

        {/* Search Bar */}
        {notes.length > 0 && <div className="mb-6">
          <Input
            placeholder="Search notes by title, description, or author..."
            prefix={<Search size={16} className="text-gray-400"  />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
            allowClear
          />
        </div>}

        {filteredNotes.length > 0 ? (
            <AppScrollbar className='max-h-100 overflow-auto'>
          <div className="space-y-4">

            {filteredNotes.map(note => (
              <NoteItem
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              />
            ))}
          </div>
            </AppScrollbar>
        ) : (
          <EmptyState
            searchTerm={searchTerm}
            onAddNote={handleAddNote}
            setSearchTerm={() => setSearchTerm('')}
          />
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <ModalWrapper
        title={editingNote ? "Edit Note" : "Add Note"}
        open={modals.note}
        onCancel={onClose}
        footer={null}
        width={600}
        destroyOnHidden
        maskClosable={false}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ dirty, isValid }) => (
            <Form id="noteForm" className="space-y-4">
              <InputBox
                name='title'
                label='Title'
                placeholder="Enter note title..."
              />

              <div className='relative'>
                <Label text='Description' required />
                <Field name="description">
                  {({ field, meta }: any) => (
                    <>
                      <Input.TextArea
                        {...field}
                        rows={6}
                        placeholder="Enter note description..."
                        status={meta.touched && meta.error ? 'error' : ''}
                      />
                      {meta.touched && meta.error && (
                        <span className="field-error">{meta.error}</span>
                      )}
                    </>
                  )}
                </Field>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={editingNote ? !dirty || !isValid : !isValid}
                  className={editingNote && !dirty ? "opacity-50" : ""}
                >
                  {editingNote ? "Update Note" : "Add Note"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </ModalWrapper>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isVisible={modals.delete}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default memo(NoteModal);