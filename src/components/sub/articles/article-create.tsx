import React from 'react';
import axios from 'axios';
import { apiPost } from '@/providers/apiRequest';
import { useRouter } from 'next/navigation';


const ArticleCreateButton: React.FC = () => {
    const router = useRouter();
    const createArticle = async () => {
        try {
            const response = await apiPost(
                process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1/article/create/',
                {
                    title: "Untitled Document",
                    description: "Lorem Ipsum dolor, lorem ipsum dolor",
                    body: {
                        type: "doc",
                        content: [
                            {
                                type: "heading",
                                attrs: {
                                    level: 2
                                },
                                content: [
                                    {
                                        type: "text",
                                        text: "Introduction"
                                    }
                                ]
                            },
                            {
                                type: "paragraph",
                                content: [
                                    {
                                        type: "text",
                                        text: ""
                                    }
                                ]
                            }
                        ]
                    }
                },
            );
            console.log('Article created:', response.data);
            var articleId = response.data.id;
            const updateURL = `/articles/update/${articleId}/`;
            router.push(updateURL)

            
        } catch (error) {
            console.error('Error creating article:', error);
        }
    };

    return (
        
        <button
            onClick={createArticle}
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
            Create Article
        </button>
    );
};

export default ArticleCreateButton;