import { LessonResource } from "@/lib/courses/types"; // ajustează calea
// Opțional: importăm iconițe dacă aveți lucide-react instalat
import { FileText, Video, ExternalLink } from "lucide-react"; 

interface LessonResourcesProps {
  resources: LessonResource[];
}

export default function LessonResources({ resources }: LessonResourcesProps) {
  if (!resources || resources.length === 0) return null;

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <div className="mt-10 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Resurse Atașate</h3>
      
      <div className="flex flex-col gap-6">
        {resources.map((resource) => {
          const embedUrl = getYouTubeEmbedUrl(resource.url);
          const isPdf = resource.url.toLowerCase().endsWith('.pdf');

          return (
            <div key={resource.id} className="p-5 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              
              
              {embedUrl ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <Video size="{20}"/>
                    <span>{resource.title}</span>
                  </div>
                  <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={embedUrl}
                      title={resource.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : (
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isPdf ? <FileText className="text-red-500" size="{24}"/> : <ExternalLink className="text-blue-500" size="{24}"/>}
                    <span className="font-medium text-gray-800 text-lg">{resource.title}</span>
                  </div>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isPdf ? "Descarcă PDF" : "Accesează Link"}
                  </a>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}