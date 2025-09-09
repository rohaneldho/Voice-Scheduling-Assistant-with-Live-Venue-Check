def implement_rag(query):
    import os
    import shutil
    import torch

    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_chroma import Chroma



    CHROMA_PATH = "chroma"
    model_name = "sentence-transformers/all-mpnet-base-v2"
    model_device = "cuda" if torch.cuda.is_available() else "cpu"
    model_kwargs = {"device": model_device}
    encode_kwargs = {'normalize_embeddings': False}

    embeddings = HuggingFaceEmbeddings(
        model_name=model_name,
        model_kwargs=model_kwargs,
        encode_kwargs=encode_kwargs
    )

    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=embeddings
    )
    # query = "According to the provided text, in which Indian states is the registration of the Internal Committee (IC) under the POSH Act explicitly mandatory?"
    results = db.similarity_search_with_relevance_scores(query, k=5)

    # for doc, score in results:
    #     print(f"SCORE: {score:.3f}")
    #     print(doc.page_content)
    #     print("-----")

    if not results:
        return "No relevent information found"
    filtered = [(doc, score) for doc, score in results]
    context_text = '''\n\n-----\n\n'''.join(doc.page_content for doc, score in filtered)
    return context_text

# print(implement_rag("According to the provided text, in which Indian states is the registration of the Internal Committee (IC) under the POSH Act explicitly?"))