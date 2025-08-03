const STROKE_WIDTH = 8;

class ImageCombiner {
  constructor() {
    this.images = [null, null];
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.uploadArea1 = document.getElementById("uploadArea1");
    this.uploadArea2 = document.getElementById("uploadArea2");
    this.imageInput1 = document.getElementById("imageInput1");
    this.imageInput2 = document.getElementById("imageInput2");

    this.previewSection = document.getElementById("previewSection");
    this.preview1 = document.getElementById("preview1");
    this.preview2 = document.getElementById("preview2");
    this.combineBtn = document.getElementById("combineBtn");

    this.resultSection = document.getElementById("resultSection");
    this.resultCanvas = document.getElementById("resultCanvas");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.formatSelect = document.getElementById("formatSelect");
  }

  setupEventListeners() {
    this.uploadArea1.addEventListener("click", () => this.imageInput1.click());
    this.uploadArea2.addEventListener("click", () => this.imageInput2.click());

    this.imageInput1.addEventListener("change", (e) =>
      this.handleImageSelect(e, 0)
    );
    this.imageInput2.addEventListener("change", (e) =>
      this.handleImageSelect(e, 1)
    );

    this.setupDragAndDrop(this.uploadArea1, 0);
    this.setupDragAndDrop(this.uploadArea2, 1);

    this.combineBtn.addEventListener("click", () => this.combineImages());
    this.downloadBtn.addEventListener("click", () => this.downloadImage());
    this.resetBtn.addEventListener("click", () => this.reset());
  }

  setupDragAndDrop(uploadArea, imageIndex) {
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("dragover");
    });

    uploadArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        this.loadImage(files[0], imageIndex);
      }
    });
  }

  handleImageSelect(event, imageIndex) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      this.loadImage(file, imageIndex);
    }
  }

  loadImage(file, imageIndex) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.images[imageIndex] = {
          file: file,
          element: img,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        this.updatePreview(imageIndex);
        this.updateUploadArea(imageIndex);
        this.checkBothImagesSelected();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  updatePreview(imageIndex) {
    const previewElement = imageIndex === 0 ? this.preview1 : this.preview2;
    const image = this.images[imageIndex];

    if (image) {
      previewElement.src = image.element.src;
      previewElement.style.display = "block";
    }
  }

  updateUploadArea(imageIndex) {
    const uploadArea = imageIndex === 0 ? this.uploadArea1 : this.uploadArea2;
    const image = this.images[imageIndex];

    if (image) {
      uploadArea.classList.add("has-image");

      const uploadContent = uploadArea.querySelector(".upload-content");
      uploadContent.innerHTML = `
        <img src="${image.element.src}" alt="Valgt bilde ${
        imageIndex + 1
      }" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: contain; margin-bottom: 1rem;">
        <h3>Bilde ${imageIndex + 1} valgt</h3>
        <p>${image.file.name}</p>
        <button class="change-image-btn" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;">Endre bilde</button>
      `;
    } else {
      uploadArea.classList.remove("has-image");

      const uploadContent = uploadArea.querySelector(".upload-content");
      uploadContent.innerHTML = `
        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7,10 12,15 17,10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <h3>Velg bilde ${imageIndex + 1}</h3>
        <p>Klikk for å bla eller dra og slipp</p>
      `;
    }
  }

  checkBothImagesSelected() {
    if (this.images[0] && this.images[1]) {
      this.showCombineButton();
      this.combineBtn.disabled = false;
    } else {
      this.hideCombineButton();
      this.combineBtn.disabled = true;
    }
  }

  showCombineButton() {
    const existingBtn = document.querySelector(".upload-section .combine-btn");
    if (existingBtn) {
      existingBtn.remove();
    }

    const uploadSection = document.querySelector(".upload-section");
    const combineBtn = document.createElement("button");
    combineBtn.id = "combineBtn";
    combineBtn.className = "combine-btn";
    combineBtn.textContent = "Kombiner bilder";
    combineBtn.addEventListener("click", () => this.combineImages());
    uploadSection.appendChild(combineBtn);
  }

  hideCombineButton() {
    const existingBtn = document.querySelector(".upload-section .combine-btn");
    if (existingBtn) {
      existingBtn.remove();
    }
  }

  combineImages() {
    if (!this.images[0] || !this.images[1]) {
      alert("Vennligst velg to bilder først.");
      return;
    }

    const img1 = this.images[0].element;
    const img2 = this.images[1].element;

    const maxHeight = Math.max(img1.height, img2.height);
    const totalWidth = Math.max(img1.width, img2.width) * 2;
    const halfWidth = totalWidth / 2;

    this.resultCanvas.width = totalWidth;
    this.resultCanvas.height = maxHeight;

    const ctx = this.resultCanvas.getContext("2d");

    ctx.clearRect(0, 0, totalWidth, maxHeight);

    this.drawImageCentered(ctx, img1, 0, 0, halfWidth, maxHeight);

    this.drawImageCentered(ctx, img2, halfWidth, 0, halfWidth, maxHeight);

    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 1.0;

    const lineX = Math.round(halfWidth);
    const lineWidth = STROKE_WIDTH;
    ctx.fillRect(lineX - lineWidth / 2, 0, lineWidth, maxHeight);
    ctx.restore();

    this.resultSection.style.display = "block";

    this.resultSection.scrollIntoView({ behavior: "smooth" });
  }

  drawImageCentered(ctx, img, x, y, width, height) {
    // Calculate aspect ratios
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > targetAspect) {
      // Image is wider than target area - crop width
      drawHeight = height;
      drawWidth = height * imgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than target area - crop height
      drawWidth = width;
      drawHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    // Draw the image centered in the target area
    ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
  }

  downloadImage() {
    if (!this.resultCanvas) return;

    const selectedFormat = this.formatSelect.value;
    const link = document.createElement("a");

    // Set appropriate MIME type and file extension based on selected format
    let mimeType, fileExtension;
    switch (selectedFormat) {
      case "webp":
        mimeType = "image/webp";
        fileExtension = "webp";
        break;
      case "png":
        mimeType = "image/png";
        fileExtension = "png";
        break;
      case "jpg":
        mimeType = "image/jpeg";
        fileExtension = "jpg";
        break;
      default:
        mimeType = "image/webp";
        fileExtension = "webp";
    }

    link.download = `kombinert-bilde.${fileExtension}`;

    this.resultCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    }, mimeType);
  }

  reset() {
    this.images = [null, null];

    this.imageInput1.value = "";
    this.imageInput2.value = "";

    this.preview1.src = "";
    this.preview2.src = "";

    this.previewSection.style.display = "none";
    this.resultSection.style.display = "none";

    this.updateUploadArea(0);
    this.updateUploadArea(1);

    this.hideCombineButton();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ImageCombiner();
});
