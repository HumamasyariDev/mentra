<?php

namespace Database\Seeders;

use App\Models\Forum;
use App\Models\Channel;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    public function run(): void
    {
        $general = Forum::create([
            'name' => 'General',
            'description' => 'General discussions and announcements',
            'icon' => '💬',
            'order' => 0,
        ]);

        Channel::insert([
            ['forum_id' => $general->id, 'name' => 'welcome', 'description' => 'Say hi to the community!', 'type' => 'text', 'order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $general->id, 'name' => 'general-chat', 'description' => 'Talk about anything', 'type' => 'text', 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $general->id, 'name' => 'announcements', 'description' => 'Important updates', 'type' => 'text', 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $productivity = Forum::create([
            'name' => 'Productivity',
            'description' => 'Share tips, tricks, and strategies',
            'icon' => '🚀',
            'order' => 1,
        ]);

        Channel::insert([
            ['forum_id' => $productivity->id, 'name' => 'tips-and-tricks', 'description' => 'Share your productivity tips', 'type' => 'text', 'order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $productivity->id, 'name' => 'goals', 'description' => 'Share and track your goals', 'type' => 'text', 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $productivity->id, 'name' => 'accountability', 'description' => 'Stay accountable with others', 'type' => 'text', 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $chill = Forum::create([
            'name' => 'Chill Zone',
            'description' => 'Relax and have fun',
            'icon' => '🎮',
            'order' => 2,
        ]);

        Channel::insert([
            ['forum_id' => $chill->id, 'name' => 'off-topic', 'description' => 'Random discussions', 'type' => 'text', 'order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $chill->id, 'name' => 'memes', 'description' => 'Share funny stuff', 'type' => 'text', 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['forum_id' => $chill->id, 'name' => 'music', 'description' => 'Share music recommendations', 'type' => 'text', 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
