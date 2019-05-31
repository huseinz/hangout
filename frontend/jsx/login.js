$("#new_btn").click(function(){
	console.log("clik");
 var x = document.getElementById("newuser_div");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
});
