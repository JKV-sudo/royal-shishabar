import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseStorage } from '../config/firebase';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

export class ImageUploadService {
  private static storage = getFirebaseStorage();

  // Validate file type and size
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPEG, PNG, or WebP)'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { isValid: true };
  }

  // Compress image before upload
  static async compressImage(file: File, maxWidth: number = 1200): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Upload image to Firebase Storage
  static async uploadImage(
    file: File,
    folder: string = 'events',
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Compress image
      const compressedFile = await this.compressImage(file);

      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${folder}/${timestamp}_${compressedFile.name}`;
      const storageRef = ref(this.storage, fileName);

      // Upload the image
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);
      
      // Return a promise that resolves with the download URL
      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Delete the image from storage
      const imageRef = ref(this.storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
} 