import pusher

pusher_client = pusher.Pusher(
  app_id='1765171',
  key='63825740c4c965adde6c',
  secret='d37c1aca59b5b7468b91',
  cluster='mt1',
  ssl=True
)

def stream(topic, data, last=False):
    status = "generating"
    if last:
        status = "ended"
    payload = {'data': data, 'status': status}
    pusher_client.trigger('updates', topic, payload)