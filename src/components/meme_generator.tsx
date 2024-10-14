"use client"; 
import { useEffect, useState, useRef } from "react"; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { Button } from "@/components/ui/button";
import Draggable from "react-draggable"; 
import html2canvas from "html2canvas"; 
import Image from "next/image"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClipLoader from "react-spinners/ClipLoader";

// Define the Meme type
type Meme = {
  id: string;
  name: string;
  url: string;
};

// Define the Position type
type Position = {
  x: number;
  y: number;
};

export default function MemeGenerator() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [visibleMemes, setVisibleMemes] = useState<Meme[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [text, setText] = useState<string>("");
  const [textPosition, setTextPosition] = useState<Position>({ x: 0, y: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [moreLoading, setMoreLoading] = useState<boolean>(false);
  const memeRef = useRef<HTMLDivElement>(null);
  const memesPerLoad = 4;

  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      const response = await fetch("https://api.imgflip.com/get_memes");
      const data = await response.json();
      setMemes(data.data.memes);
      setVisibleMemes(data.data.memes.slice(0, memesPerLoad));
      setLoading(false);
    };
    fetchMemes();
  }, []);

  const loadMoreMemes = (): void => {
    setMoreLoading(true);
    const newVisibleMemes = memes.slice(0, visibleMemes.length + memesPerLoad);
    setVisibleMemes(newVisibleMemes);
    setMoreLoading(false);
  };

  const handleDownload = async (): Promise<void> => {
    if (memeRef.current) {
      const canvas = await html2canvas(memeRef.current);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "meme.png";
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 text-gray-800"> {/* Changed background color */}
      <div className="max-w-4xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-blue-600">
              Meme Generator
            </h1>
            <p className="text-gray-600">
              Create custom memes with our easy-to-use generator.
            </p>
          </div>
          {loading ? (
            <ClipLoader className="w-12 h-12 text-blue-500" />
          ) : (
            <>
              <div className="w-full overflow-x-scroll whitespace-nowrap py-2">
                {visibleMemes.map((meme) => (
                  <Card
                    key={meme.id}
                    className="inline-block bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 mx-2"
                    onClick={() => setSelectedMeme(meme)}
                  >
                    <Image
                      src={meme.url}
                      alt={meme.name}
                      width={300}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                    <CardContent>
                      <p className="text-center font-semibold text-gray-800">{meme.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {visibleMemes.length < memes.length && (
                <Button
                  onClick={loadMoreMemes}
                  className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                  disabled={moreLoading}
                >
                  {moreLoading ? (
                    <ClipLoader className="w-6 h-6 text-white" />
                  ) : (
                    "Load More"
                  )}
                </Button>
              )}
            </>
          )}
          {selectedMeme && (
            <Card className="w-full max-w-md bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-800">Customize Your Meme</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={memeRef} className="relative bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={selectedMeme.url}
                    alt={selectedMeme.name}
                    width={300}
                    height={300}
                    className="object-cover w-full h-full"
                  />
                  <Draggable
                    position={textPosition}
                    onStop={(_, data) => {
                      setTextPosition({ x: data.x, y: data.y });
                    }}
                  >
                    <div
                      className="absolute text-black text-xl font-bold bg-white p-2 rounded shadow"
                      style={{ left: textPosition.x, top: textPosition.y }}
                    >
                      {text}
                    </div>
                  </Draggable>
                </div>
                <div className="mt-4">
                  <Label htmlFor="meme-text" className="text-gray-600">Add your text</Label>
                  <Textarea
                    id="meme-text"
                    placeholder="Enter your meme text"
                    className="mt-1 w-full border border-gray-300 rounded-lg"
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <Button className="w-full mt-4 bg-green-600 text-white hover:bg-green-700" onClick={handleDownload}>
                  Download Meme
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
