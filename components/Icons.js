import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon } from 'react-native-svg';

const d = { size: 24, color: '#1a3a5c', strokeWidth: 2 };

// ── Tab Bar ──────────────────────────────────────────────────────────────────
export const HomeIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const CoursesIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const UpdatesIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ProfileIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={sw}/>
    <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
  </Svg>
);

export const UploadIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ── File Types ────────────────────────────────────────────────────────────────
export const PdfIcon = ({ size=d.size, color='#E53935', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const DocIcon = ({ size=d.size, color='#1976D2', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12h6m-6 4h6M9 8h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const PptIcon = ({ size=d.size, color='#E65100', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={18} height={14} rx={2} stroke={color} strokeWidth={sw}/>
    <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
  </Svg>
);

export const VideoIcon = ({ size=d.size, color='#7B2FBE', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ImageIcon = ({ size=d.size, color='#2d9e5f', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21zM16.5 9.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const FileIcon = ({ size=d.size, color='#555', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ── Actions ───────────────────────────────────────────────────────────────────
export const SearchIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const BellIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const DeleteIcon = ({ size=d.size, color='#E53935', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const EditIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ChevronRight = ({ size=d.size, color='#aaa', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8.25 4.5l7.5 7.5-7.5 7.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ChevronLeft = ({ size=d.size, color='#fff', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15.75 19.5L8.25 12l7.5-7.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const LogoutIcon = ({ size=d.size, color='#E53935', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const HistoryIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const PlayIcon = ({ size=d.size, color='#fff', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const FolderIcon = ({ size=d.size, color=d.color, sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25A2.25 2.25 0 004.5 16.5h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const ApproveIcon = ({ size=d.size, color='#2EAB6F', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const PinIcon = ({ size=d.size, color='#1736F5', sw=d.strokeWidth }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Helper — returns SVG component for file type
export const getFileIcon = (fileType, size=28) => {
  const ft = fileType?.toLowerCase();
  if (['pdf'].includes(ft))              return <PdfIcon   size={size} />;
  if (['doc','docx'].includes(ft))       return <DocIcon   size={size} />;
  if (['ppt','pptx'].includes(ft))       return <PptIcon   size={size} />;
  if (['mp4','mov','webm'].includes(ft)) return <VideoIcon size={size} />;
  if (['jpg','jpeg','png'].includes(ft)) return <ImageIcon size={size} />;
  return <FileIcon size={size} />;
};

// Helper — returns color for file type
export const getFileColor = (fileType) => {
  const ft = fileType?.toLowerCase();
  if (['pdf'].includes(ft))              return '#E53935';
  if (['doc','docx'].includes(ft))       return '#1976D2';
  if (['ppt','pptx'].includes(ft))       return '#E65100';
  if (['mp4','mov','webm'].includes(ft)) return '#7B2FBE';
  if (['jpg','jpeg','png'].includes(ft)) return '#2d9e5f';
  return '#555';
};
