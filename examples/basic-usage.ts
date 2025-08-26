import { Synthesia } from '../src';

async function basicUsageExample() {
  const synthesia = new Synthesia({
    apiKey: 'your-api-key-here',
  });

  try {
    console.log('Creating a video...');
    
    const createVideoResult = await synthesia.videos.createVideo({
      title: 'My First Video',
      scriptText: 'Hello world! This is my first Synthesia video.',
      avatar: 'anna_costume1_cameraA',
      background: 'green_screen',
      test: true,
    });

    if (createVideoResult.error) {
      console.error('Error creating video:', createVideoResult.error.message);
      return;
    }

    const video = createVideoResult.data!;
    console.log('Video created:', video.id);

    console.log('Listing all videos...');
    const listResult = await synthesia.videos.listVideos();
    
    if (listResult.error) {
      console.error('Error listing videos:', listResult.error.message);
      return;
    }

    console.log(`Found ${listResult.data!.count} videos`);

    console.log('Getting video details...');
    const getResult = await synthesia.videos.getVideo(video.id);
    
    if (getResult.error) {
      console.error('Error getting video:', getResult.error.message);
      return;
    }

    console.log('Video status:', getResult.data!.status);
    
    if (getResult.data!.download) {
      console.log('Download URL:', getResult.data!.download);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

if (require.main === module) {
  basicUsageExample();
}