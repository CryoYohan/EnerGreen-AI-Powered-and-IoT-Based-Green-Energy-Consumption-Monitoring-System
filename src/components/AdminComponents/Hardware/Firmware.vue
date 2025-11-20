<template>
  <div class="p-6 font-poppins m-5 lg:m-10 bg-white dark:bg-gray-800 rounded-xl shadow dark:shadow-gray-700">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Firmware Management</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and deploy OTA updates to your devices.</p>
      </div>
      
      <button 
        @click="showUploadModal = true"
        class="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        New Deployment
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-green-50 dark:bg-green-900/30 flex flex-col items-center justify-center rounded-xl border border-green-100 dark:border-green-800 p-6">
        <p class="text-3xl font-bold text-green-700 dark:text-green-400">{{ latestVersion }}</p>
        <p class="text-sm text-green-600 dark:text-green-300 mt-1">Current Stable Version</p>
      </div>

      <div class="bg-blue-50 dark:bg-blue-900/30 flex flex-col items-center justify-center rounded-xl border border-blue-100 dark:border-blue-800 p-6">
        <p class="text-3xl font-bold text-blue-700 dark:text-blue-400">{{ totalReleases }}</p>
        <p class="text-sm text-blue-600 dark:text-blue-300 mt-1">Total Releases</p>
      </div>

      <div class="bg-gray-50 dark:bg-gray-700/30 flex flex-col items-center justify-center rounded-xl border border-gray-100 dark:border-gray-600 p-6">
        <p class="text-xl font-bold text-gray-700 dark:text-gray-300">{{ lastDeployed }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Deployment</p>
      </div>
    </div>

    <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Release History</h3>
    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Version</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Size</th>
            <th class="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notes</th>
            <th class="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="(release, index) in releaseHistory" :key="release.id">
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">{{ release.version }}</td>
            <td class="px-6 py-4 text-gray-500 dark:text-gray-400">{{ formatDate(release.uploadedAt) }}</td>
            <td class="px-6 py-4 text-gray-500 dark:text-gray-400">{{ formatBytes(release.size) }}</td>
            <td class="px-6 py-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ release.description }}</td>
            <td class="px-6 py-4 text-right">
              <span 
                :class="index === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ index === 0 ? 'Latest' : 'Archived' }}
              </span>
            </td>
          </tr>
          <tr v-if="releaseHistory.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
              No firmware releases found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg transform transition-all">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Deploy New Firmware</h3>
        
        <form @submit.prevent="handleUpload">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Version Tag</label>
              <input 
                v-model="newVersion" 
                type="text" 
                required
                placeholder="e.g. v1.2.0"
                class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500" 
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Release Notes</label>
              <textarea 
                v-model="newDescription" 
                rows="3"
                required
                placeholder="What features or fixes are in this update?"
                class="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500" 
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Firmware Binary (.bin)</label>
              <div 
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer"
                :class="{'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20': isDragging}"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()"
              >
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept=".bin" 
                  class="hidden" 
                  @change="handleFileSelect" 
                />
                
                <div v-if="!selectedFile">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span class="font-medium text-emerald-600 hover:text-emerald-500">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-500">ESP32 Binary files only (.bin)</p>
                </div>

                <div v-else class="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <div class="flex items-center overflow-hidden">
                    <svg class="h-8 w-8 text-emerald-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                       <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                    <div class="truncate">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ selectedFile.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatBytes(selectedFile.size) }}</p>
                    </div>
                  </div>
                  <button type="button" @click.stop="selectedFile = null" class="text-red-500 hover:text-red-700 p-1">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="uploading" class="mt-4">
             <div class="flex justify-between mb-1">
               <span class="text-xs font-medium text-emerald-700 dark:text-emerald-400">Uploading...</span>
               <span class="text-xs font-medium text-emerald-700 dark:text-emerald-400">{{ uploadProgress.toFixed(0) }}%</span>
             </div>
             <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div class="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="showUploadModal = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="!selectedFile || uploading || !newVersion"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="uploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ uploading ? 'Deploying...' : 'Deploy Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db, storage } from '@/firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';

const showUploadModal = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const isDragging = ref(false);

const newVersion = ref('');
const newDescription = ref('');
const selectedFile = ref(null);
const releaseHistory = ref([]);

// --- File Handling ---
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  validateFile(file);
};

const handleDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  validateFile(file);
};

const validateFile = (file) => {
  if (file && file.name.endsWith('.bin')) {
    selectedFile.value = file;
  } else {
    Swal.fire('Invalid File', 'Please select a compiled .bin file.', 'warning');
  }
};

// --- Upload Logic ---
const handleUpload = async () => {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 1. Create Storage Reference (e.g., firmware/v1.2.0_17150000.bin)
    const filename = `firmware_${newVersion.value}_${Date.now()}.bin`;
    const firmwareStorageRef = storageRef(storage, `firmware/${filename}`);
    
    // 2. Start Upload Task
    const uploadTask = uploadBytesResumable(firmwareStorageRef, selectedFile.value);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgress.value = progress;
      }, 
      (error) => {
        console.error("Upload error:", error);
        Swal.fire('Upload Failed', error.message, 'error');
        uploading.value = false;
      }, 
      async () => {
        // 3. Upload Complete - Get URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // 4. Save Metadata to Firestore
        await addDoc(collection(db, 'firmware_releases'), {
          version: newVersion.value,
          description: newDescription.value,
          downloadURL: downloadURL,
          filename: filename,
          size: selectedFile.value.size,
          uploadedAt: serverTimestamp(),
          status: 'Active' // You can use this to toggle which one is the "Current" one
        });

        // 5. Cleanup
        uploading.value = false;
        showUploadModal.value = false;
        selectedFile.value = null;
        newVersion.value = '';
        newDescription.value = '';
        
        Swal.fire({
          icon: 'success',
          title: 'Deployment Successful',
          text: 'The new firmware is now available for devices.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    );

  } catch (error) {
    console.error("Deployment error:", error);
    uploading.value = false;
    Swal.fire('Error', error.message, 'error');
  }
};

// --- Fetch History ---
let unsubscribe = null;

onMounted(() => {
  // Fetch releases ordered by newest first
  const q = query(collection(db, 'firmware_releases'), orderBy('uploadedAt', 'desc'));
  unsubscribe = onSnapshot(q, (snapshot) => {
    releaseHistory.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// --- Computed Stats ---
const latestVersion = computed(() => releaseHistory.value[0]?.version || 'v0.0.0');
const totalReleases = computed(() => releaseHistory.value.length);
const lastDeployed = computed(() => {
  const last = releaseHistory.value[0];
  return last ? formatDate(last.uploadedAt) : 'Never';
});

// --- Helpers ---
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>