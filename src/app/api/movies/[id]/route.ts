import { NextRequest, NextResponse } from 'next/server';
import { movieDB } from '@/lib/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const movie = movieDB.getMovieById(id);
    
    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    if (body.action === 'toggleFavorite') {
      const movie = movieDB.getMovieById(id);
      if (!movie) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }
      
      const newStatus = movieDB.toggleFavorite(id);
      return NextResponse.json({ 
        isFavourite: newStatus,
        message: `Movie ${newStatus ? 'added to' : 'removed from'} favorites`
      });
    }

    if (body.action === 'toggleWatchlist') {
      const movie = movieDB.getMovieById(id);
      if (!movie) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }
      
      const newStatus = movieDB.toggleWatchlist(id);
      return NextResponse.json({ 
        isInWatchlist: newStatus,
        message: `Movie ${newStatus ? 'added to' : 'removed from'} watchlist`
      });
    }

    if (body.action === 'updateRating') {
      const { rating } = body;
      
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 10) {
        return NextResponse.json(
          { error: 'Rating must be a number between 1 and 10' },
          { status: 400 }
        );
      }

      const movie = movieDB.getMovieById(id);
      if (!movie) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }

      try {
        const success = movieDB.updateRating(id, rating);
        if (success) {
          return NextResponse.json({ 
            rating,
            message: `Movie rating updated to ${rating}/10`
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to update rating' },
            { status: 500 }
          );
        }
      } catch (error) {
        let message = 'Failed to update rating';
        if (error instanceof Error) {
          message = error.message;
        }
        return NextResponse.json(
          { error: message },
          { status: 400 }
        );
      }
    }

    if (body.action === 'updateMovie') {
      const { updates } = body;
      
      // Validate that updates object exists and has valid fields
      if (!updates || typeof updates !== 'object') {
        return NextResponse.json(
          { error: 'Updates object is required' },
          { status: 400 }
        );
      }

      // Validate allowed fields
      const allowedFields = ['title', 'description', 'code', 'publishedAt', 'coverUrl', 'videoUrl'];
      const updateKeys = Object.keys(updates);
      const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
      
      if (invalidFields.length > 0) {
        return NextResponse.json(
          { error: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}` },
          { status: 400 }
        );
      }

      if (updateKeys.length === 0) {
        return NextResponse.json(
          { error: 'At least one field must be provided for update' },
          { status: 400 }
        );
      }

      // Check if movie exists
      const movie = movieDB.getMovieById(id);
      if (!movie) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }

      try {
        const success = movieDB.updateMovie(id, updates);
        if (success) {
          // Return the updated movie
          const updatedMovie = movieDB.getMovieById(id);
          return NextResponse.json({ 
            movie: updatedMovie,
            message: 'Movie updated successfully'
          });
        } else {
          return NextResponse.json(
            { error: 'Failed to update movie' },
            { status: 500 }
          );
        }
      } catch (error) {
        let message = 'Failed to update movie';
        if (error instanceof Error) {
          message = error.message;
        }
        return NextResponse.json(
          { error: message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating movie:', error);
    return NextResponse.json(
      { error: 'Failed to update movie' },
      { status: 500 }
    );
  }
}
