-- Create follows table
CREATE TABLE IF NOT EXISTS "public"."follows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "follower_id" "uuid" NOT NULL,
    "followed_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "follows_follower_id_followed_id_key" UNIQUE ("follower_id", "followed_id"),
    CONSTRAINT "follows_follower_id_followed_id_check" CHECK ("follower_id" != "followed_id")
);

ALTER TABLE "public"."follows" OWNER TO "postgres";

-- Create likes table
CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "likes_user_id_post_id_key" UNIQUE ("user_id", "post_id")
);

ALTER TABLE "public"."likes" OWNER TO "postgres";

-- Add RLS policies for follows table
ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" ON "public"."follows"
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own follows" ON "public"."follows"
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON "public"."follows"
    FOR DELETE USING (auth.uid() = follower_id);

-- Add RLS policies for likes table
ALTER TABLE "public"."likes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON "public"."likes"
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON "public"."likes"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON "public"."likes"
    FOR DELETE USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."follows" ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_follows_follower_id" ON "public"."follows"("follower_id");
CREATE INDEX IF NOT EXISTS "idx_follows_followed_id" ON "public"."follows"("followed_id");
CREATE INDEX IF NOT EXISTS "idx_likes_user_id" ON "public"."likes"("user_id");
CREATE INDEX IF NOT EXISTS "idx_likes_post_id" ON "public"."likes"("post_id");
