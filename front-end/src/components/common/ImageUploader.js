import React, { useState, useRef, useEffect } from 'react';

const ImageUploader = ({ onUpload, onDelete, initialImageUrl, label, maxSizeMB = 10 }) => {
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        setImageUrl(initialImageUrl);
    }, [initialImageUrl]);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверяем размер файла
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Максимальный размер файла: ${maxSizeMB}MB`);
            return;
        }

        // Проверяем тип файла
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Поддерживаются только изображения (JPEG, PNG, GIF, WebP)');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await onUpload(file);

            // Создаем preview для отображения
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            setError(error.message || 'Ошибка при загрузке изображения');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete();
            setImageUrl('');
            setError('');
        } catch (error) {
            setError(error.message || 'Ошибка при удалении изображения');
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="image-uploader">
            <label className="form-group">
                <span className="label-text">{label}</span>
                <div className="upload-area">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />

                    {imageUrl ? (
                        <div className="image-preview">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                            <div className="image-actions">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn btn-sm"
                                    disabled={uploading}
                                >
                                    📁 Заменить
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="btn btn-sm btn-danger"
                                    disabled={uploading}
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="empty-upload"
                            onClick={() => fileInputRef.current.click()}
                            style={{
                                padding: '40px',
                                border: '2px dashed #000000',
                                borderRadius: '8px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#f5f5f5'
                            }}
                        >
                            <div className="upload-icon" style={{ fontSize: '2rem', marginBottom: '10px' }}>📷</div>
                            <div className="upload-text">
                                <p>Нажмите для загрузки изображения</p>
                                <p className="upload-hint" style={{ fontSize: '0.9rem', color: '#666' }}>
                                    Макс. размер: {maxSizeMB}MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </label>

            {error && (
                <div className="error-message" style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#fff5f5',
                    color: '#ff4444',
                    borderRadius: '6px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            {uploading && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'center'
                }}>
                    Загрузка изображения...
                </div>
            )}
        </div>
    );
};

export default ImageUploader;