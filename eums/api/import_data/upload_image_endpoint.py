from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from eums.models.upload import UploadForm, Upload
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
def upload_image(request):
    if request.method == "POST":
        photo = UploadForm(request.POST, request.FILES)
        logger.info(photo)
        if photo.is_valid():
            photo.save()
        return JsonResponse({'success': status.HTTP_204_NO_CONTENT})
    elif request.method == "GET":
        plan_id = request.GET.get('plan', None)
        data = []
        if plan_id:
            uploads = Upload.objects.filter(plan_id=plan_id)
            for upload in uploads.iterator():
                data.append({'plan': str(upload.plan.id), 'url': str(upload.file)})
        return JsonResponse({'images': data})
    else:
        return JsonResponse({'error': 'File data not supplied'})
