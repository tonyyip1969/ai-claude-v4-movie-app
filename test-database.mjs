#!/usr/bin/env node

// Test script for database methods
import { movieDB } from './src/lib/database.js';

console.log('🧪 Testing Database Methods...\n');

try {
  // Test 1: Get movie counts
  console.log('📊 Movie Counts:');
  const counts = movieDB.getMovieCounts();
  console.log(`Total: ${counts.total}, Favorites: ${counts.favorites}, Watchlist: ${counts.watchlist}\n`);

  // Test 2: Get first movie (if any exists)
  console.log('🎬 Testing with first available movie:');
  const movies = movieDB.getAllMovies();
  
  if (movies.length === 0) {
    console.log('❌ No movies found in database. Please add some movies first.');
    process.exit(1);
  }

  const testMovie = movies[0];
  console.log(`Using movie: "${testMovie.title}" (ID: ${testMovie.id}, Code: ${testMovie.code})\n`);

  // Test 3: Test getMovieByCode method
  console.log('🔍 Testing getMovieByCode:');
  const foundMovie = movieDB.getMovieByCode(testMovie.code);
  console.log(`Found movie by code "${testMovie.code}": ${foundMovie ? '✅ Success' : '❌ Failed'}\n`);

  // Test 4: Test getMovieByCode with exclusion
  console.log('🔍 Testing getMovieByCode with exclusion:');
  const excludedMovie = movieDB.getMovieByCode(testMovie.code, testMovie.id);
  console.log(`Found movie by code "${testMovie.code}" excluding ID ${testMovie.id}: ${excludedMovie ? '❌ Should be null' : '✅ Correctly excluded'}\n`);

  // Test 5: Test updateMovie method
  console.log('✏️ Testing updateMovie:');
  const originalTitle = testMovie.title;
  const testTitle = `${originalTitle} [UPDATED]`;
  
  const updateSuccess = movieDB.updateMovie(testMovie.id, {
    title: testTitle,
    description: 'Updated description for testing'
  });
  
  console.log(`Update operation: ${updateSuccess ? '✅ Success' : '❌ Failed'}`);
  
  if (updateSuccess) {
    const updatedMovie = movieDB.getMovieById(testMovie.id);
    console.log(`Title updated: "${updatedMovie?.title}"`);
    
    // Revert the change
    movieDB.updateMovie(testMovie.id, {
      title: originalTitle,
      description: testMovie.description
    });
    console.log('✅ Test changes reverted\n');
  }

  // Test 6: Test validation errors
  console.log('🚫 Testing validation errors:');
  try {
    movieDB.updateMovie(testMovie.id, {
      title: '', // Empty title should fail
    });
    console.log('❌ Empty title validation failed');
  } catch (error) {
    console.log(`✅ Empty title correctly rejected: ${error.message}`);
  }

  try {
    movieDB.updateMovie(testMovie.id, {
      code: testMovie.code.length > 1 ? testMovie.code.slice(0, -1) + 'X' : testMovie.code + 'X', // Try to create duplicate
    });
    
    // If we get here, check if there was actually a duplicate
    const duplicateCheck = movieDB.getMovieByCode(testMovie.code.length > 1 ? testMovie.code.slice(0, -1) + 'X' : testMovie.code + 'X', testMovie.id);
    if (duplicateCheck) {
      console.log('❌ Duplicate code validation failed - duplicate exists');
    } else {
      console.log('✅ No duplicate exists, update was valid');
    }
  } catch (error) {
    console.log(`✅ Duplicate code correctly rejected: ${error.message}`);
  }

  console.log('\n🎉 All database tests completed!');

} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
