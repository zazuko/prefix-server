<script>
export default {
  asyncData ({ redirect, query }) {
    if (query.q) {
      redirect('/' + query.q)
      return
    }
    redirect('/')
  }
}
</script>
