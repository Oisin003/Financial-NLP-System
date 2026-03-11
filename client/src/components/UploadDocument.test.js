import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UploadDocument from './UploadDocument';
import { useFileUpload } from '../hooks/useFileUpload';

// Mock the upload hook so tests stay simple and fast.
jest.mock('../hooks/useFileUpload', () => ({
  useFileUpload: jest.fn()
}));

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('UploadDocument component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('keeps upload button disabled when no file is selected', () => {
    // Return empty upload state from the mocked hook.
    useFileUpload.mockReturnValue({
      selectedFile: null,
      uploading: false,
      message: { type: '', text: '' },
      selectFile: jest.fn(),
      removeFile: jest.fn(),
      upload: jest.fn(),
      setMessage: jest.fn()
    });

    renderWithRouter(<UploadDocument />);

    const button = screen.getByRole('button', { name: /upload document/i });
    expect(button).toBeDisabled();
  });

  test('calls upload when submit is pressed with a selected file', () => {
    const uploadMock = jest.fn();

    useFileUpload.mockReturnValue({
      selectedFile: { name: 'report.pdf', size: 1024 },
      uploading: false,
      message: { type: '', text: '' },
      selectFile: jest.fn(),
      removeFile: jest.fn(),
      upload: uploadMock,
      setMessage: jest.fn()
    });

    renderWithRouter(<UploadDocument />);

    fireEvent.click(screen.getByRole('button', { name: /upload document/i }));
    expect(uploadMock).toHaveBeenCalledTimes(1);
  });
});
