(function () {
    function fitRect(srcW, srcH, dstW, dstH) {
        const scale = Math.min(dstW / srcW, dstH / srcH);
        const w = srcW * scale;
        const h = srcH * scale;
        return {
            x: (dstW - w) / 2,
            y: (dstH - h) / 2,
            w,
            h,
        };
    }

    window.mountCanvasVideo = function mountCanvasVideo(options) {
        const video = document.getElementById(options.videoId);
        const canvas = document.getElementById(options.canvasId);
        if (!video || !canvas) return;

        video.style.display = 'none';
        video.controls = false;
        video.disablePictureInPicture = true;
        video.setAttribute('disablepictureinpicture', '');
        video.setAttribute('disableremoteplayback', '');
        video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback noplaybackrate');

        const ctx = canvas.getContext('2d');
        let dpr = 1;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(rect.width * dpr));
            canvas.height = Math.max(1, Math.round(rect.height * dpr));
        }

        function syncSmallLayout() {
            if (!options.small) return;
            if (!video.videoWidth) return;
            const maxW = Math.min(220, window.innerWidth * 0.42);
            const scale = maxW / video.videoWidth;
            canvas.style.width = `${maxW}px`;
            canvas.style.height = `${video.videoHeight * scale}px`;
            resize();
        }

        function draw() {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (video.readyState >= 2 && video.videoWidth > 0) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                if (options.small) {
                    ctx.drawImage(video, 0, 0, width, height);
                } else {
                    const fit = fitRect(video.videoWidth, video.videoHeight, width, height);
                    ctx.drawImage(video, fit.x, fit.y, fit.w, fit.h);
                }
            }

            requestAnimationFrame(draw);
        }

        function playVideo() {
            const attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(() => {});
            }
        }

        video.addEventListener('loadedmetadata', () => {
            syncSmallLayout();
            playVideo();
        });

        video.addEventListener('loadeddata', playVideo);

        if (options.small) {
            window.addEventListener('resize', syncSmallLayout);
        } else {
            window.addEventListener('resize', resize);
        }

        if (options.small) syncSmallLayout();
        else resize();

        draw();
        playVideo();
    };
})();
