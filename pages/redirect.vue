<script>
export default {
  name: 'Redirect',
  asyncData ({ redirect, query }) {
    if (query.q) {
      redirect('/' + query.q)
    }
    else {
      redirect('/')
    }
  }
}
</script>
