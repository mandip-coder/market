"use client";
import { toast } from "@/components/AppToaster/AppToaster";
import InputBox from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import ModalWrapper from "@/components/Modal/Modal";
import { Button, Input, Modal } from "antd";
import dayjs from "dayjs";
import { Field, Form, Formik } from "formik";
import {
  Calendar,
  Edit,
  NotebookIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useState, useMemo, useCallback, memo } from "react";
import * as Yup from "yup";
import AppScrollbar from "@/components/AppScrollBar";
import { Note } from "@/lib/types";
import { EmptyState } from "@/components/shared/modals/EmptyState";
import Paragraph from "antd/es/typography/Paragraph";
import { Deal } from "../../services/deals.types";
import {
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "../../services/deals.hooks";

// Memoized note item component to prevent unnecessary re-renders
const NoteItem = memo(
  ({
    note,
    onEdit,
    onDelete,
  }: {
    note: Note;
    onEdit: (note: Note) => void;
    onDelete: (noteUUID: string) => void;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 h-full">
      <div className="p-3">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 dark:text-white text-lg pr-2">
              {note.title}
            </h4>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              <div className="flex items-center mr-4">
                <User size={14} className="mr-1.5" />
                <span>{note.createdBy}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1.5" />
                <span>{dayjs(note.createdAt).format("D MMM, YYYY")}</span>
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
              onClick={() => onDelete(note.noteUUID)}
              className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
              aria-label="Delete note"
            />
          </div>
        </div>

        <div className="mt-3">
          <Paragraph ellipsis={{ rows: 3, tooltip: note.description }}>
            {note.description}
          </Paragraph>
        </div>
      </div>
    </div>
  )
);

NoteItem.displayName = "NoteItem";

// Main component
const NoteModal = ({
  deal,
  notes,
  refetching,
  refetch,
}: {
  deal: Deal;
  notes: Note[];
  refetching: boolean;
  refetch: () => void;
}) => {
  const [modal, contextHolder] = Modal.useModal();

  // React Query hooks
  const createNote = useCreateNote(deal.dealUUID);
  const updateNote = useUpdateNote(deal.dealUUID);
  const deleteNote = useDeleteNote(deal.dealUUID);

  // Modal state for add/edit note
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize validation schema to prevent recreation on every render
  const validationSchema = useMemo(
    () =>
      Yup.object({
        title: Yup.string()
          .required("Title is required")
          .max(100, "Title must be less than 100 characters")
          .min(3, "Title must be at least 3 characters")
          .max(200, "Title must be less than 200 characters"),
        description: Yup.string()
          .required("Description is required")
          .max(5000, "Description must be less than 500 characters")
          .min(3, "Description must be at least 3 characters")
          .max(5000, "Description must be less than 500 characters"),
      }),
    []
  );

  // Memoize filtered notes
  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        note.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        note.createdBy.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [notes, searchTerm]);

  // Memoize initial values
  const initialValues: Partial<Note> = useMemo(
    () => ({
      title: editingNote ? editingNote.title : "",
      description: editingNote ? editingNote.description : "",
    }),
    [editingNote]
  );

  // Memoize modal close handler
  const onClose = useCallback(() => {
    setIsNoteModalOpen(false);
    setEditingNote(null);
  }, []);

  // Memoize add note handler
  const handleAddNote = useCallback(() => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  }, []);

  // Memoize edit note handler
  const handleEditNote = useCallback((note: any) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  }, []);

  // Memoize delete note handler with Modal.useModal
  const handleDeleteNote = useCallback(
    (note: Note) => {
      modal.confirm({
        title: (
          <div className="flex items-center gap-2">
            <span>Delete Note</span>
          </div>
        ),
        content: (
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <strong> {note.title}</strong> note?
            This action cannot be undone.
          </p>
        ),
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        width: 450,
        onOk: () => {
          deleteNote.mutate(note.noteUUID);
        },
      });
    },
    [deleteNote, modal]
  );

  // Memoize form submit handler
  const handleSubmit = useCallback(
    (values: any) => {
      const formattedValues = {
        ...values,
        dealUUID: deal.dealUUID,
      };

      if (editingNote) {
        updateNote.mutate(
          { noteUUID: editingNote.noteUUID, data: formattedValues },
          {
            onSuccess: () => {
              onClose();
            },
          }
        );
      } else {
        createNote.mutate(formattedValues, {
          onSuccess: () => {
            onClose();
          },
        });
      }
    },
    [editingNote, updateNote, createNote, onClose, deal.dealUUID]
  );

  return (
    <>
      {contextHolder}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-0">
            Notes
          </h3>
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
        <div className="mb-6 flex items-center gap-2 justify-between">
          <Input
            placeholder="Search notes by title, description, or author..."
            prefix={<Search size={16} className="text-gray-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
            allowClear
          />
          <Button
            size="small"
            icon={
              <RefreshCw
                size={16}
                className={refetching ? "animate-spin" : ""}
              />
            }
            onClick={refetch}
            title="Refresh calls"
          >
            Refresh
          </Button>
        </div>

        {filteredNotes.length > 0 ? (
          <AppScrollbar className="max-h-100 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteItem
                  key={note.noteUUID}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={() => handleDeleteNote(note)}
                />
              ))}
            </div>
          </AppScrollbar>
        ) : (
          <EmptyState
            searchTitle="Search notes by title, description, or author..."
            actionLabel="Add First Note"
            emptyDescription="Start by creating your first note."
            emptyTitle="No Notes Yet"
            onAction={handleAddNote}
            icon={NotebookIcon}
            onClearSearch={() => setSearchTerm("")}
            searchQuery={searchTerm}
          />
        )}
      </div>

      {/* Add/Edit Note Modal */}
      <ModalWrapper
        title={editingNote ? "Edit Note" : "Add Note"}
        open={isNoteModalOpen}
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
                name="title"
                label="Title"
                minLength={3}
                maxLength={200}
                placeholder="Enter note title..."
                required
              />

              <div className="relative">
                <Label text="Description" required />
                <Field name="description">
                  {({ field, meta }: any) => (
                    <>
                      <Input.TextArea
                        {...field}
                        rows={6}
                        maxLength={5000}
                        showCount
                        autoSize={{ minRows: 4, maxRows: 6 }}
                        minLength={3}
                        placeholder="Enter note description..."
                        status={meta.touched && meta.error ? "error" : ""}
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
                  loading={createNote.isPending || updateNote.isPending}
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
    </>
  );
};

export default memo(NoteModal);
