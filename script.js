let video = document.getElementById("video");
let canvas = document.body.appendChild(document.createElement("canvas"));
let ctx = canvas.getContext("2d");
let model;

let width = 1280;
let height = 720;

const startSteam = () => {
    navigator.mediaDevices.getUserMedia({
        video : {width: width, height: height},
        audio : false
    }).then((stream) => { video.srcObject = stream});
}

async function main() {
    const faces = await model.estimateFaces({
      input: video
    });

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.drawImage(video, 0,0, width,height);
  
    drawMesh(faces, ctx);
}

function drawPath(ctx, points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);

    for (let i =1; i < points.length; i++){
        const point = points[i];
        region.lineTo(point[0], point[1]);
    }
    if(closePath) {
        region.closePath();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = "yellow";
    ctx.stroke(region);
}

function drawMesh(faces, cxt) {
    // Jika terdapat wajah yang terdeteksi
    if (faces.length > 0) {

        faces.forEach(face => {
          console.log(face);

          //==== GAMBAR BOX ====
          ctx.beginPath();
          ctx.lineWidth = 5;
          ctx.strokeStyle = "yellow";
          ctx.rect(
              face.boundingBox.topLeft[0],
              face.boundingBox.topLeft[1],
              face.boundingBox.bottomRight[0] - face.boundingBox.topLeft[0],
              face.boundingBox.bottomRight[1] - face.boundingBox.topLeft[1]
          );
          ctx.stroke();


          //============ BEGIN:  REAL SIZE LANDMARK =================
          const keypoints = face.scaledMesh;          
    
          // Gambar titik landmark
          for (let i = 0; i < keypoints.length; i++) {
            const [x, y, z] = keypoints[i];
    
            ctx.beginPath();
            ctx.arc(x,y,2,0,2 * Math.PI);
            ctx.fillStyle = "yellow";
            ctx.fill();
          } 
        
          // Gambar Garis antar titik
          for (let i = 0; i < TRIANGULATION.length / 3; i++){
              const points = [
                  TRIANGULATION[i * 3],
                  TRIANGULATION[i * 3+1],
                  TRIANGULATION[i * 3+2],
              ].map((index)  => keypoints[index]);

              drawPath(ctx, points, true);
          }

          //============ BEGIN:  MINI SIZE LANDMARK =================
          const keypoints_mini = face.mesh;          
    
          // Gambar titik landmark
          for (let i = 0; i < keypoints_mini.length; i++) {
            const [x, y, z] = keypoints_mini[i];
    
            ctx.beginPath();
            ctx.arc(x,y,2,0,2 * Math.PI);
            ctx.fillStyle = "yellow";
            ctx.fill();
          } 
        
          // Gambar Garis antar titik
          for (let i = 0; i < TRIANGULATION.length / 3; i++){
              const points = [
                  TRIANGULATION[i * 3],
                  TRIANGULATION[i * 3+1],
                  TRIANGULATION[i * 3+2],
              ].map((index)  => keypoints_mini[index]);

              drawPath(ctx, points, true);
          }          
        });  
      }
}

startSteam();
video.addEventListener("loadeddata", async () => {
    // Load the MediaPipe Facemesh package.
    model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);

    setInterval(main, 10);
})