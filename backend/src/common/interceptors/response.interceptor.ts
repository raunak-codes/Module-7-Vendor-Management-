import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination: unknown;
  errors: unknown[];
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => ({
        success: true,
        message: res?.message ?? 'Success',
        data: res?.data !== undefined ? res.data : res,
        pagination: res?.pagination ?? null,
        errors: [],
      })),
    );
  }
}
