import dynamic from 'next/dynamic';
import React from 'react';
import { ReactQuillProps } from 'react-quill';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
});

export const QuillEditor = (props:ReactQuillProps) => {
  // React Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // React Quill formats configuration
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'link', 'image'
  ];

  return (
    //@ts-ignore
    <ReactQuill
      theme="snow"
      modules={quillModules}
      formats={quillFormats}
      {...props}
    />
  );
};
