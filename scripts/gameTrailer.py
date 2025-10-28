"""
Game Trailer Generator for TheNinja-RPG
Uses MoviePy to create a 30-second trailer with effects, transitions, and text overlays
"""

from moviepy import (
    VideoFileClip,
    AudioFileClip,
    TextClip,
    ImageClip,
    CompositeVideoClip,
    concatenate_videoclips,
    concatenate_audioclips,
    ColorClip,
    vfx,
    afx,
)
import os
import argparse
import numpy as np
from PIL import Image, ImageDraw

# Configuration
CLIPS_DIR = "clips"  # Directory containing the recorded video clips
OUTPUT_FILE = "theninja_rpg_trailer.mp4"
VIDEO_SIZE = (1920, 1080)  # Target resolution
FPS = 30

# Background music (located in clips directory)
BACKGROUND_MUSIC = os.path.join(CLIPS_DIR, "xevan_welcome_to_seichi_compressed.m4a")

WALLPAPER = os.path.join(CLIPS_DIR, "wallpaper-bright.webp")

LOGO_FILE = os.path.join(CLIPS_DIR, "logo_final.webp")

FONT_FILE = os.path.join(CLIPS_DIR, "aAsianNinja.ttf")

# Recorded clips metadata
RECORDED_CLIPS = [
    {"file": "combat.mp4", "seconds": 5, "description": "combat between two players"},
    {"file": "village.mp4", "seconds": 1, "description": "village hub overview showing all the buildings"},
    {"file": "training.mp4", "seconds": 4, "description": "training ground overview showing all the training options"},
    {"file": "itemshop.mp4", "seconds": 10, "description": "shows the item shop and purchase of item"},
    {"file": "jutsus.mov", "seconds": 9, "description": "shows a list scrolling through justsus"},
    {"file": "global.mp4", "seconds": 3, "description": "global map of seichi"},
    {"file": "sector.mp4", "seconds": 2, "description": "travel in sector"},
    {"file": "equipment.mov", "seconds": 5, "description": "shows user inventory"},
    {"file": "profile.mov", "seconds": 7, "description": "show the user profile and stats"},
    {"file": "bloodline.mov", "seconds": 9, "description": "shows the various bloodlines and their effects"},
    {"file": "quest.mp4", "seconds": 7, "description": "demonstrates the quest system"},
]

# Timeline segments with text overlays
# Each segment has a duration in seconds - much simpler!
# Total content: 59 seconds + 0.5s intro + 4s outro = ~63.5 seconds
TIMELINE = [
    {
        "duration": 7,
        "text": "ARE YOU READY TO\nAWAKEN YOUR NINJA LEGACY?",
        "clips": ["profile.mov"],
    },
    {
        "duration": 5,
        "text": "FIGHT STRATEGIC BATTLES\nUSING NINJUTSU, TAIJUTSU, GENJUTSU or WEAPONS",
        "clips": ["combat.mp4"],
    },
    {
        "duration": 5,
        "text": "EXPLORE THE WORLD OF SEICHI\nIN A MASSIVE MULTIPLAYER ONLINE GAME",
        "clips": ["global.mp4", "sector.mp4"],
    },
    {
        "duration": 5,
        "text": "TRAIN YOUR STATS\nAND MASTER YOUR JUTSUS",
        "clips": ["training.mp4"],
    },

    {
        "duration": 9,
        "text": "CLAIM YOUR BLOODLINE\nAND UNLOCK UNIQUE ABILITIES",
        "clips": ["bloodline.mov"],
    },
    {
        "duration": 5,
        "text": "800+ UNIQUE JUTSU AND \n50+ BLOODLINES",
        "clips": ["jutsus.mov"],
    },
    {
        "duration":7,
        "text": "CUSTOMIZE YOUR NINJA",
        "clips": ["itemshop.mp4", "equipment.mov"],
    },
    
    {
        "duration":7,
        "text": "AND GO ON EPIC QUESTS \nTO SUPPORT YOUR VILLAGE",
        "clips": ["quest.mp4"],
    },
]


def create_wind_particles(duration, size=VIDEO_SIZE, num_particles=50):
    """Create a wind particle effect overlay"""
    def make_frame(t):
        # Create transparent RGBA image
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Set random seed based on time for consistent but animated particles
        np.random.seed(42)
        
        # Generate particles with different speeds and positions
        for i in range(num_particles):
            # Each particle has its own speed and starting position
            speed = 100 + (i * 7) % 200  # Pixels per second
            start_x = (i * 113) % size[0]  # Stagger starting positions
            y_pos = (i * 37) % size[1]  # Vertical position
            
            # Calculate current x position (wrap around)
            x_pos = (start_x + speed * t) % (size[0] + 100) - 100
            
            # Particle properties
            particle_length = 20 + (i % 30)
            particle_width = 1 + (i % 2)
            opacity = 40 + (i % 60)  # Vary opacity between particles
            
            # Draw particle as a line (wind streak)
            draw.line(
                [(x_pos, y_pos), (x_pos + particle_length, y_pos)],
                fill=(255, 255, 255, opacity),
                width=particle_width
            )
        
        return np.array(img)
    
    from moviepy import VideoClip
    particle_clip = VideoClip(make_frame, duration=duration)
    return particle_clip


def create_text_screen(text, duration, size=VIDEO_SIZE, fontsize=None, color="white"):
    """Create a full-screen text clip with centered text on wallpaper background"""
    # Auto-scale font size based on resolution if not specified
    if fontsize is None:
        fontsize = int(size[1] / 9)  # Large, bold text
    
    # Timing for fade effects
    wallpaper_fade_duration = 0.4
    text_delay = 0.5  # Delay before text starts fading in
    text_fade_duration = 0.3
    
    # Create wallpaper background with fade-in
    if os.path.exists(WALLPAPER):
        try:
            bg = ImageClip(WALLPAPER).with_duration(duration)
            # Resize to fit the target size
            bg = bg.resized(size)
            # Add fade-in to wallpaper
            bg = bg.with_effects([vfx.FadeIn(wallpaper_fade_duration)])
        except Exception as e:
            print(f"⚠ Could not load wallpaper: {e}, using black background")
            bg = ColorClip(size=size, color=(0, 0, 0)).with_duration(duration)
    else:
        print(f"⚠ Wallpaper not found: {WALLPAPER}, using black background")
        bg = ColorClip(size=size, color=(0, 0, 0)).with_duration(duration)
    
    # Determine which font to use
    if os.path.exists(FONT_FILE):
        font = FONT_FILE
    else:
        print(f"⚠ Custom font not found: {FONT_FILE}, using Impact fallback")
        font = "Impact"
    
    # Create wind particle effect
    particles = create_wind_particles(duration, size=size)
    
    # Create text clip with delayed fade-in and black stroke
    txt = (
        TextClip(
            text=text,
            font=font,
            font_size=fontsize,
            color=color,
            size=(int(size[0] * 0.9), None),
            method="caption",
            text_align="center",
            stroke_color="black",
            stroke_width=3,
        )
        .with_duration(duration - text_delay)
        .with_position("center")
        .with_start(text_delay)
        .with_effects([vfx.FadeIn(text_fade_duration)])
    )
    
    # Composite: background -> particles -> text
    composite = CompositeVideoClip([bg, particles, txt], size=size)
    
    return composite


def load_and_prepare_clip(clip_name, target_duration, size=VIDEO_SIZE, speed_factor=1.0):
    """Load a video clip, resize, and adjust duration"""
    # Handle clip names that already include file extension
    clip_path = os.path.join(CLIPS_DIR, clip_name)
    
    if not os.path.exists(clip_path):
        print(f"Warning: {clip_path} not found, creating placeholder")
        return ColorClip(size=size, color=(20, 20, 40), duration=target_duration)
    
    clip = VideoFileClip(clip_path)
    
    # Adjust speed if needed to fit duration
    if speed_factor != 1.0:
        clip = clip.with_effects([vfx.MultiplySpeed(speed_factor)])
    
    # Take only the needed duration
    actual_duration = min(clip.duration, target_duration / speed_factor)
    clip = clip.subclipped(0, actual_duration)
    
    # Resize to target size maintaining aspect ratio
    clip = clip.resized(height=size[1])
    
    # Center crop if wider than target
    if clip.w > size[0]:
        x_center = clip.w / 2
        x1 = int(x_center - size[0] / 2)
        clip = clip.cropped(x1=x1, width=size[0])
    
    # Add padding if narrower than target
    if clip.w < size[0]:
        bg = ColorClip(size=size, color=(0, 0, 0), duration=clip.duration)
        clip = CompositeVideoClip([bg, clip.with_position("center")], size=size)
    
    return clip.with_duration(target_duration)


def create_segment(timeline_item, video_size=VIDEO_SIZE):
    """Create a segment with text screen followed by video clips"""
    total_duration = timeline_item["duration"]
    clip_names = timeline_item["clips"]
    
    # Allocate time: 35% for text screen + 0.5s extra linger, remaining for clips
    text_duration = total_duration * 0.35 + 0.5
    clips_duration = total_duration * 0.65 - 0.5
    
    # Create text screen (fade-in is handled internally)
    text_screen = create_text_screen(timeline_item["text"], text_duration, size=video_size)
    text_screen = text_screen.with_effects([vfx.FadeOut(0.3)])
    
    # Calculate duration per clip
    duration_per_clip = clips_duration / len(clip_names)
    
    # Load and prepare video clips
    video_clips = []
    for clip_name in clip_names:
        # Speed up clips slightly if needed to fit multiple clips
        speed_factor = 1.2 if len(clip_names) > 1 else 1.0
        clip = load_and_prepare_clip(clip_name, duration_per_clip, size=video_size, speed_factor=speed_factor)
        clip = clip.with_effects([vfx.FadeIn(0.3), vfx.FadeOut(0.3)])
        video_clips.append(clip)
    
    # Concatenate video clips
    if len(video_clips) > 1:
        video_section = concatenate_videoclips(video_clips, method="compose")
    else:
        video_section = video_clips[0]
    
    # Concatenate text screen and video clips
    final_segment = concatenate_videoclips([text_screen, video_section], method="compose")
    
    return final_segment


def load_background_music(duration):
    """Load and prepare background music for the trailer"""
    if not os.path.exists(BACKGROUND_MUSIC):
        print(f"⚠ Background music not found: {BACKGROUND_MUSIC}")
        return None
    
    try:
        audio = AudioFileClip(BACKGROUND_MUSIC)
        
        # Loop the audio if it's shorter than the trailer duration
        if audio.duration < duration:
            # Calculate how many loops we need
            loops_needed = int(duration / audio.duration) + 1
            audio = concatenate_audioclips([audio] * loops_needed)
        
        # Trim to exact duration
        audio = audio.subclipped(0, duration)
        
        # Add fade in and fade out effects, and reduce volume
        audio = audio.with_effects([
            afx.AudioFadeIn(3.0),  # Longer fade-in for smoother start
            afx.AudioFadeOut(2.0),
            afx.MultiplyVolume(0.49)  # Reduced to 70% of previous volume (0.7 * 0.7)
        ])
        
        print(f"✓ Background music loaded: {BACKGROUND_MUSIC}")
        return audio
    except Exception as e:
        print(f"⚠ Error loading background music: {e}")
        return None


def create_outro(duration=4, video_size=VIDEO_SIZE):
    """Create the final outro segment with logo and call-to-action"""
    # Auto-scale font sizes based on resolution
    cta_font_size = int(video_size[1] / 14)   # CTA text
    url_font_size = int(video_size[1] / 18)   # URL text
    
    # Determine which font to use
    if os.path.exists(FONT_FILE):
        font = FONT_FILE
    else:
        font = "Impact"
    
    # Wallpaper background
    if os.path.exists(WALLPAPER):
        try:
            bg = ImageClip(WALLPAPER).with_duration(duration)
            bg = bg.resized(video_size)
        except Exception as e:
            print(f"⚠ Could not load wallpaper for outro: {e}, using black background")
            bg = ColorClip(size=video_size, color=(0, 0, 0), duration=duration)
    else:
        print(f"⚠ Wallpaper not found for outro: {WALLPAPER}, using black background")
        bg = ColorClip(size=video_size, color=(0, 0, 0), duration=duration)
    
    elements = [bg]
    
    # Try to load the game logo
    if os.path.exists(LOGO_FILE):
        try:
            logo = ImageClip(LOGO_FILE)
            # Scale logo to fit nicely (max 60% of screen width, 40% of height)
            max_width = int(video_size[0] * 0.6)
            max_height = int(video_size[1] * 0.4)
            
            # Calculate scaling
            scale = min(max_width / logo.w, max_height / logo.h)
            logo = logo.resized(scale)
            
            # Position logo in upper-center area
            logo = (
                logo
                .with_duration(duration)
                .with_position(("center", int(video_size[1] * 0.2)))
            )
            elements.append(logo)
            
            # Adjust text positions to be below logo
            cta_y_pos = int(video_size[1] * 0.6)
            url_y_pos = int(video_size[1] * 0.75)
            
        except Exception as e:
            print(f"⚠ Could not load logo: {e}, using text fallback")
            # Fallback to text if logo fails
            cta_y_pos = int(video_size[1] * 0.5)
            url_y_pos = int(video_size[1] * 0.68)
    else:
        print(f"⚠ Logo not found: {LOGO_FILE}")
        # No logo, use text-only layout
        cta_y_pos = int(video_size[1] * 0.5)
        url_y_pos = int(video_size[1] * 0.68)
    
    # Call to action - bold and clean with black stroke
    cta = (
        TextClip(
            text="SIGN UP FREE",
            font=font,
            font_size=cta_font_size,
            color="white",
            text_align="center",
            stroke_color="black",
            stroke_width=3,
        )
        .with_duration(duration)
        .with_position(("center", cta_y_pos))
    )
    elements.append(cta)
    
    # Website URL with black stroke
    url = (
        TextClip(
            text="www.TheNinja-RPG.com",
            font=font,
            font_size=url_font_size,
            color="white",
            text_align="center",
            stroke_color="black",
            stroke_width=3,
        )
        .with_duration(duration)
        .with_position(("center", url_y_pos))
    )
    elements.append(url)
    
    # Add wind particle effect (inserted after background, before logo/text)
    particles = create_wind_particles(duration, size=video_size)
    elements.insert(1, particles)  # Insert after background (index 0)
    
    # Composite all elements
    outro = CompositeVideoClip(elements, size=video_size)
    outro = outro.with_effects([vfx.FadeIn(0.5)])
    
    return outro


def create_trailer(preview_mode=False):
    """Main function to create the complete trailer"""
    # Adjust settings for preview mode
    if preview_mode:
        video_size = (640, 360)  # Much lower resolution for faster rendering (360p)
        fps = 10  # Very low FPS
        preset = "ultrafast"  # Fastest encoding
        bitrate = "1000k"  # Lower bitrate
        threads = 8
        output_file = "theninja_rpg_trailer_preview.mp4"
        print("Creating TheNinja-RPG Trailer (PREVIEW MODE)...")
        print("⚡ Using fast preview settings for quick iteration (360p)")
    else:
        video_size = VIDEO_SIZE
        fps = FPS
        preset = "medium"
        bitrate = "8000k"
        threads = 8
        output_file = OUTPUT_FILE
        print("Creating TheNinja-RPG Trailer...")
    
    # Calculate total duration from segments
    total_segment_duration = sum(item["duration"] for item in TIMELINE)
    total_with_intro_outro = 0.5 + total_segment_duration + 4  # fade-in + segments + outro
    
    print(f"Target duration: ~{int(total_with_intro_outro)} seconds ({total_segment_duration}s content + intro/outro)")
    print(f"Resolution: {video_size[0]}x{video_size[1]}")
    print(f"FPS: {fps}")
    print(f"Preset: {preset}")
    print()
    
    # Create all segments
    segments = []
    
    # Fade in from black
    fade_in = ColorClip(size=video_size, color=(0, 0, 0), duration=0.5)
    fade_in = fade_in.with_effects([vfx.FadeOut(0.5)])
    segments.append(fade_in)
    
    # Create timeline segments
    for i, timeline_item in enumerate(TIMELINE):
        print(f"Creating segment {i+1}/{len(TIMELINE)} ({timeline_item['duration']}s): {timeline_item['text'][:40]}...")
        segment = create_segment(timeline_item, video_size=video_size)
        segments.append(segment)
    
    # Create outro
    print("Creating outro segment...")
    outro = create_outro(duration=4, video_size=video_size)
    segments.append(outro)
    
    # Concatenate all segments
    print("Concatenating all segments...")
    final_trailer = concatenate_videoclips(segments, method="compose")
    
    print(f"Final trailer duration: {final_trailer.duration:.2f} seconds")
    
    # Load and attach background music
    print("\nLoading background music...")
    background_audio = load_background_music(final_trailer.duration)
    if background_audio:
        final_trailer = final_trailer.with_audio(background_audio)
        print("✓ Background music attached to trailer")
    else:
        print("⚠ Trailer will be created without background music")
    
    # Export the final video
    print(f"\nExporting to {output_file}...")
    final_trailer.write_videofile(
        output_file,
        fps=fps,
        codec="libx264",
        audio_codec="aac",
        preset=preset,
        threads=threads,
        bitrate=bitrate,
    )
    
    # Clean up
    final_trailer.close()
    
    print(f"\n✓ Trailer created successfully: {output_file}")
    print(f"Duration: {final_trailer.duration:.2f} seconds")
    
    if preview_mode:
        print("\n⚡ Preview mode complete! Use without --preview for final high-quality render.")


if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(
        description="Create TheNinja-RPG game trailer with MoviePy",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python gameTrailer.py              # Create full high-quality trailer (1080p)
  python gameTrailer.py --preview    # Create quick preview (360p, ~5x faster)
  
Note: Trailer duration is automatically calculated from segment durations in TIMELINE.
        """
    )
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Create a quick low-quality preview for faster iteration (360p, 10fps, ultrafast preset)"
    )
    args = parser.parse_args()
    
    # Create clips directory if it doesn't exist
    os.makedirs(CLIPS_DIR, exist_ok=True)
    
    print("=" * 60)
    print("TheNinja-RPG Game Trailer Generator")
    print("=" * 60)
    print()
    print(f"Looking for video clips in: {os.path.abspath(CLIPS_DIR)}")
    print()
    
    # Check for available clips
    available_clips = []
    for clip_info in RECORDED_CLIPS:
        clip_path = os.path.join(CLIPS_DIR, clip_info["file"])
        if os.path.exists(clip_path):
            available_clips.append(clip_info["file"])
    
    if available_clips:
        print(f"Found {len(available_clips)} video clips:")
        for clip in available_clips:
            print(f"  ✓ {clip}")
    else:
        print("⚠ No video clips found. Placeholders will be used.")
        print(f"  Place your .mp4 clips in: {os.path.abspath(CLIPS_DIR)}")
    
    print()
    
    # Check for background music
    if os.path.exists(BACKGROUND_MUSIC):
        print(f"Background music: ✓ {BACKGROUND_MUSIC}")
    else:
        print(f"Background music: ⚠ {BACKGROUND_MUSIC} (not found)")
    
    # Check for logo
    if os.path.exists(LOGO_FILE):
        print(f"Logo: ✓ {LOGO_FILE}")
    else:
        print(f"Logo: ⚠ {LOGO_FILE} (not found, will use text fallback)")
    
    # Check for custom font
    if os.path.exists(FONT_FILE):
        print(f"Font: ✓ {FONT_FILE}")
    else:
        print(f"Font: ⚠ {FONT_FILE} (not found, will use Impact fallback)")
    
    print()
    print("Starting trailer creation...")
    print()
    
    try:
        create_trailer(preview_mode=args.preview)
    except Exception as e:
        print(f"\n✗ Error creating trailer: {e}")
        import traceback
        traceback.print_exc()