import {
  CalendarCheck2Icon,
  LibraryBigIcon,
  LoaderIcon,
  SparklesIcon,
} from "lucide-react";

export default function Layout() {
  return (
    <div>
      <h1>Schedulr</h1>
      <div className="relative bottom justify-between">
        <LibraryBigIcon size={48} />
        <CalendarCheck2Icon size={48} />
        <LoaderIcon size={48} />
        <SparklesIcon color="" size={48} />
      </div>
    </div>
  );
}
