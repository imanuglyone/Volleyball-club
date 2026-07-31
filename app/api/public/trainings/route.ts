import { NextResponse } from 'next/server';
import { getPublicTrainings } from '@/lib/dal/trainings';
import { PUBLIC_SCHEDULE_CACHE } from '@/lib/public-api';
import {
  isValidClubDate,
  normalizePublicTrainingRange,
} from '@/lib/public-training-range';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedFrom = url.searchParams.get('from');
    const requestedTo = url.searchParams.get('to');
    if (
      (requestedFrom && !isValidClubDate(requestedFrom))
      || (requestedTo && !isValidClubDate(requestedTo))
      || (
        requestedFrom
        && requestedTo
        && requestedTo < requestedFrom
      )
    ) {
      return NextResponse.json(
        { error: 'validation' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    const { from, to } = normalizePublicTrainingRange(
      requestedFrom,
      requestedTo,
    );
    const response = NextResponse.json({
      version: 1,
      trainings: await getPublicTrainings(from, to)
    });
    response.headers.set('Cache-Control', PUBLIC_SCHEDULE_CACHE);
    return response;
  } catch (error) {
    console.error('Public trainings fetch failed', {
      kind: error instanceof Error ? error.name : 'unknown'
    });
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
