// src/app/(dashboard)/articles/update/[id]/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Tiptap from '@/components/main/tip-tap';
import NavbarArticles from '@/components/sub/navbars/navbar-articles';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  description: string;
  body: any; // Adjust the type based on the actual structure of the body
}

interface ArticleUpdateProps {
  params: {
    id: string;
  };
}

export default function ArticleUpdate({ params }: ArticleUpdateProps) {
  const router = useRouter();
  const { id } = params; // Access the dynamic segment
  const { data: session, status } = useSession();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.error === 'RefreshAccessTokenError') {
      router.push('/user/login');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (id && status === 'authenticated') {
      // Fetch the article data using the id
      const fetchArticle = async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
          const response = await fetch(`${backendUrl}/api/v1/article/detail/${id}/`, {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`, // Assuming you have accessToken in session
            },
          });
          const data = await response.json();
          console.log('Fetched article data:', data); // Log the response to verify the structure
          console.log('Type of article.body:', typeof data.body); // Log the type of article.body

          let body = data.body;

          // Parse body if it's a string
          if (typeof body === 'string') {
            try {
              body = JSON.parse(body);
              console.log('Parsed body:', body); // Log the parsed body
            } catch (error) {
              console.error('Error parsing article.body JSON:', error);
              // Handle parsing error appropriately
            }
          }

          setArticle({
            id: data.id,
            title: data.title,
            description: data.description,
            body: body,
          });
        } catch (error) {
          console.error('Error fetching article:', error);
          // Handle fetch error appropriately
        }
      };

      fetchArticle();
    }
  }, [id, status, session]);

  if (status === 'loading' || !article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div>
        <NavbarArticles />
      </div>
      <div className="flex flex-col">
        <Tiptap initialContent={article.body} articleId={id} />
      </div>
    </div>
  );
}