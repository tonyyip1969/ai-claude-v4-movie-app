import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  // Optional: Add URL whitelist for security
  const allowedDomains: string[] = [
    // 'devstreaming-cdn.apple.com',
    // 'commondatastorage.googleapis.com',
    // 'test-streams.mux.dev',
    // Add your allowed domains here
  ];

  const urlObj = new URL(url);
  const isAllowed = allowedDomains.length === 0 || allowedDomains.some(domain => 
    urlObj.hostname.includes(domain)
  );

  if (!isAllowed) {
    return NextResponse.json(
      { error: 'Domain not allowed' },
      { status: 403 }
    );
  }

  try {
    // Determine content type based on file extension
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isVideoSegment = ['ts', 'm4s', 'mp4'].includes(fileExtension);
    const isManifest = ['m3u8', 'mpd'].includes(fileExtension);
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HLS-Proxy/1.0)',
        'Accept': isVideoSegment 
          ? 'video/MP2T, video/MP4, */*' 
          : isImage 
            ? 'image/jpeg, image/png, image/gif, image/webp, */*'
            : 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
        'Range': request.headers.get('range') || '', // Forward range headers for video segments
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream server error: ${response.status}` },
        { status: response.status }
      );
    }

    // Get content type from response or infer it from file extension
    let contentType = response.headers.get('content-type') || '';
    
    if (!contentType) {
      if (isVideoSegment) {
        contentType = fileExtension === 'mp4' ? 'video/mp4' : 'video/MP2T';
      } else if (isManifest) {
        contentType = 'application/vnd.apple.mpegurl';
      } else if (isImage) {
        contentType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      }
    }

    // Handle binary content (video segments and images)
    if (isVideoSegment || isImage) {
      const arrayBuffer = await response.arrayBuffer();
      
      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Length': response.headers.get('content-length') || '',
          'Content-Range': response.headers.get('content-range') || '',
          'Accept-Ranges': 'bytes',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Handle text manifests
    const data = await response.text();
    let processedData = data;
    
    if (isManifest || contentType.includes('mpegurl') || contentType.includes('m3u8')) {
      // Rewrite relative URLs in the manifest to use our proxy
      const lines = data.split('\n');
      processedData = lines.map(line => {
        if (line.startsWith('http')) {
          // Absolute URL - proxy it
          return `/api/hls-proxy?url=${encodeURIComponent(line)}`;
        } else if (line && !line.startsWith('#') && line.trim()) {
          // Relative URL - make it absolute and proxy it
          const absoluteUrl = new URL(line, url).toString();
          return `/api/hls-proxy?url=${encodeURIComponent(absoluteUrl)}`;
        }
        return line;
      }).join('\n');
    }

    return new NextResponse(processedData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cache-Control': isManifest ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from upstream server' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
