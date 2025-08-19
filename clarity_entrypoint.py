from scripts.pipeline_clarity import run_clarity_pipeline

def clarity_entrypoint(request):
    run_clarity_pipeline()
    return 'Clarity pipeline executed', 200
