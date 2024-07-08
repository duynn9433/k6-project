import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

// export let options = {
//   vus: 1, // Number of virtual users
//   duration: '10s', // Test duration
// };

export const options = {
    stages: [
        {
            duration: '60s',
            target: 100
        },
        {
            duration: '300s',
            target: 100
        },
        {
            duration: '60s',
            target: 0
        }
    ]
}


const MANIFEST_URL = 'https://es1-p2-netcdn.tv360.vn/netcdn-live/198/output/198-audio_133600_eng=131600-video=6730000.m3u8?timestamp=1817589485&uid=12345&token=c49efc60dbec21047f4159f4cf55687c';

export default function () {
  // Request the manifest file
  let res = http.get(MANIFEST_URL);
  check(res, {
    'manifest is 200': (r) => r.status === 200,
  });

  // Parse the manifest file to get the video segment URLs
  let manifestContent = res.body;
  let segmentUrls = parseManifest(manifestContent);

  // Request each video segment
//   segmentUrls.forEach((url) => {
    let segmentRes = http.get(segmentUrls[segmentUrls.length - 1]);
    check(segmentRes, {
      'segment is 200': (r) => r.status === 200,
      'segment is not empty': (r) => r.body.length > 0,
    });
    sleep(2); // Sleep to simulate real user behavior
//   });
}

function parseManifest(manifestContent) {
  let lines = manifestContent.split('\n');
  let segmentUrls = [];
  for (let line of lines) {
    line = line.trim(); // Remove any leading/trailing whitespace
    if (line && !line.startsWith('#')) {
      // Add the base URL if needed
      let segmentUrl = new URL(line, MANIFEST_URL).href;
      segmentUrls.push(segmentUrl);
    }
  }
  return segmentUrls;
}
