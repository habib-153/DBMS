# Post Verification Score & Report Feature Implementation

## Overview

This implementation adds a comprehensive verification score system and post reporting feature to your DBMS crime reporting application.

## Features Implemented

### 1. Verification Score System

The verification score is automatically calculated based on community engagement:

**Formula:**

```
Base Score: 50 points
+ Post Upvotes: +2 points each
+ Post Downvotes: -1 point each
+ Comments: +1 point each
+ Comment Upvotes: +0.5 points each
+ Comment Downvotes: -0.25 points each
+ Reports: -5 points each
```

**Auto-Removal:**

- Posts with verification score ≤ 0 are automatically marked as deleted
- Posts with 10 or more reports are automatically removed

### 2. Post Report Feature

- Users can report inappropriate posts
- Each report reduces verification score by 5 points
- Multiple predefined report reasons (spam, inappropriate content, violence, harassment, false information, other)
- Optional description for additional context
- One user can only report a post once
- Reports are tracked and can be viewed by admins

## Database Changes

### New Table: `post_reports`

```sql
CREATE TABLE IF NOT EXISTS post_reports (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY ("id"),
    CONSTRAINT post_reports_userId_postId_key UNIQUE ("userId", "postId")
);
```

### Modified Table: `posts`

Added two new columns:

- `verificationScore` DECIMAL(10, 2) DEFAULT 50.0 NOT NULL
- `reportCount` INTEGER DEFAULT 0 NOT NULL

### Migration Script

Run the migration script: `Server/schema-reports.sql`

```bash
# For Neon PostgreSQL or your database:
psql YOUR_DATABASE_URL < Server/schema-reports.sql
```

## Backend Changes

### Modified Files:

1. **`Server/src/app/interfaces/database.types.ts`**

   - Added `DbPostReport` interface
   - Added `DbPostReportWithUser` interface
   - Added `verificationScore` and `reportCount` to `DbPost`

2. **`Server/src/app/modules/Post/post.interface.ts`**

   - Added `TReportPost` interface for report data

3. **`Server/src/app/modules/Post/post.validation.ts`**

   - Added `reportPostValidationSchema` for validating report requests

4. **`Server/src/app/modules/Post/post.service.raw.ts`**

   - Added `calculateVerificationScore()` - calculates and updates verification score
   - Added `reportPost()` - creates a new report and recalculates score
   - Added `getPostReports()` - retrieves all reports for a post (admin only)
   - Updated `addPostVote()` to trigger score recalculation
   - Updated `removePostVote()` to trigger score recalculation
   - Updated `getSinglePost()` to include reports data

5. **`Server/src/app/modules/Post/post.controller.ts`**

   - Added `reportPost` controller
   - Added `getPostReports` controller

6. **`Server/src/app/modules/Post/post.route.ts`**

   - Added `POST /:postId/report` route (authenticated users)
   - Added `GET /:postId/reports` route (admin only)

7. **`Server/src/app/modules/Comment/comment.service.ts`**

   - Updated `createComment()` to trigger verification score recalculation
   - Updated `addCommentVote()` to trigger verification score recalculation
   - Updated `removeCommentVote()` to trigger verification score recalculation

8. **`Server/src/app.ts`**
   - Updated CORS configuration to support credentials with specific origin

## Frontend Changes

### New Components:

1. **`Client/src/components/UI/modal/ReportPostModal.tsx`**

   - Modal for reporting posts
   - Predefined report reasons
   - Optional description field
   - Visual warning about report consequences

2. **`Client/src/components/UI/VerificationScoreBadge.tsx`**
   - Displays verification score with color-coded badges
   - Shows report count if > 0
   - Visual indicators (shield icons) for score level

### Modified Files:

1. **`Client/src/types/post.types.ts`**

   - Added `verificationScore` and `reportCount` to `IPost`
   - Added `IPostReport` interface
   - Added `reports` array to `IPost`

2. **`Client/src/services/PostServices/index.ts`**

   - Added `reportPost()` service function
   - Added `getPostReports()` service function

3. **`Client/src/hooks/post.hook.ts`**

   - Added `useReportPost()` hook
   - Added `useGetPostReports()` hook

4. **`Client/src/app/(WithCommonLayout)/posts/[id]/page.tsx`**
   - Added verification score badge display
   - Added report button in post header
   - Added report modal integration
   - Added report handler function

## API Endpoints

### New Endpoints:

#### Report a Post

```
POST /api/v1/posts/:postId/report
Authorization: Required (USER, ADMIN, SUPER_ADMIN)

Body:
{
  "reason": "Spam or misleading",
  "description": "Optional detailed description"
}

Response:
{
  "success": true,
  "message": "Post reported successfully",
  "data": {
    "verificationScore": 45.5
  }
}
```

#### Get Post Reports (Admin Only)

```
GET /api/v1/posts/:postId/reports
Authorization: Required (ADMIN, SUPER_ADMIN)

Response:
{
  "success": true,
  "message": "Post reports retrieved successfully",
  "data": [
    {
      "id": "report-id",
      "postId": "post-id",
      "userId": "user-id",
      "reason": "Spam or misleading",
      "description": "Optional description",
      "createdAt": "2025-10-04T...",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userProfilePhoto": "..."
    }
  ]
}
```

## UI/UX Features

### Verification Score Display

- **Highly Verified** (≥60): Green badge with shield check icon
- **Verified** (40-59): Blue badge with shield check icon
- **Low Verification** (20-39): Yellow badge with shield alert icon
- **Unverified** (<20): Red badge with shield X icon

### Report Feature

- Flag icon button in post header
- Modal with predefined report reasons
- Optional description field
- Warning message about report consequences
- Anonymous reporting (reports tracked but not publicly visible to regular users)

### Consistent Design

- Matches existing UI patterns using HeroUI components
- Responsive design for mobile and desktop
- Dark mode support
- Proper loading states and error handling

## Testing Checklist

### Backend:

- [ ] Run database migration script
- [ ] Test post creation (should have initial score of 50)
- [ ] Test upvoting a post (score should increase by 2)
- [ ] Test downvoting a post (score should decrease by 1)
- [ ] Test commenting on a post (score should increase by 1)
- [ ] Test upvoting a comment (score should increase by 0.5)
- [ ] Test reporting a post (score should decrease by 5)
- [ ] Test reporting same post twice (should fail)
- [ ] Test auto-removal at 10 reports
- [ ] Test auto-removal when score ≤ 0
- [ ] Test admin viewing reports

### Frontend:

- [ ] Verification badge displays correctly
- [ ] Report button appears in post details
- [ ] Report modal opens and closes properly
- [ ] Can submit a report successfully
- [ ] Cannot submit report without selecting reason
- [ ] Toast notifications appear for success/error
- [ ] Score updates after interactions
- [ ] Dark mode styling works correctly
- [ ] Mobile responsive design works

## Environment Setup

### Backend:

No additional environment variables needed. Uses existing database connection.

### Frontend:

No additional environment variables needed. Uses existing API configuration.

## Deployment Notes

1. **Database Migration**: Run the migration script on your production database before deploying code
2. **CORS Configuration**: Updated to support credentials - ensure frontend URL is correctly configured
3. **Backwards Compatibility**: Existing posts will have default score of 50 and reportCount of 0

## Future Enhancements

Potential improvements for future iterations:

1. Email notifications to admins when post reaches threshold
2. Report analytics dashboard
3. Appeal system for removed posts
4. Reputation system for users based on their posts' scores
5. Machine learning for automatic content moderation
6. Report history view for users
7. Bulk admin actions for managing reports
8. Automated verification score adjustments based on post age

## Troubleshooting

### Common Issues:

1. **CORS errors**: Ensure `Server/src/app.ts` has correct frontend URL
2. **Verification score not updating**: Check that all vote/comment hooks call `calculateVerificationScore()`
3. **Reports not showing**: Verify database migration ran successfully
4. **Modal not appearing**: Check that ReportPostModal component is imported correctly

## Support

For issues or questions:

1. Check the implementation files for inline comments
2. Review the error logs in browser console / server logs
3. Verify database schema matches expected structure
4. Ensure all dependencies are installed (`npm install` on both client and server)

## Credits

Implemented by: GitHub Copilot
Date: October 4, 2025
Version: 1.0.0
