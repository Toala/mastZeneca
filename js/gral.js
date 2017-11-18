$(document).ready(function() {
	$('.opt').click(function() {
		var id = $(this).attr("id");
		var current = $('#current').val();

		$(".menu").removeClass('oculto');


		$("." + current).addClass('oculto');
		$("." + id).removeClass('oculto');
		
		reset();

		$(".presentacion").addClass('oculto');
		$('#current').val(id);
	});


	$('.doctor-item').click(function(){
		var id = $(this).attr("id");

		$('.doctor').addClass('doc-'+id);
		$('.if-med').addClass('info-'+id);
		$('.info-speaker').addClass('speaker-'+id);

		
		$.getJSON('js/cv.json', function(response){
			$('.info-'+id).html(response.cv[(id)].description);
    	});

    	$('.container-speakers').addClass('oculto');
		$('.phase-2').removeClass('oculto');
	});

	function reset() {
		$( ".doctor" ).removeClass('doc-0 doc-1 doc-2');
		$( ".info-speaker" ).removeClass('speaker-0 speaker-1 speaker-2');
		$( ".if-med" ).text("").removeClass('info-0 info-1 info-2');

		$('.container-speakers').removeClass('oculto');
		$('.phase-2').addClass('oculto');		
	}

	$(".pase-pagina").touchwipe({
	   wipeLeft: function() 
	   {
	   		var visible=$("#visible-pre").val();
	        var pag=parseInt($("#pag-pre-"+visible).val());
	        var total=parseInt($("#total-pre-"+visible).val());
	        var siguiente=1;
            siguiente+=pag;
            if (siguiente<=total) {
                $(".pre-paginas-"+visible).hide();
                $(".pag-"+visible+"-"+siguiente).show();
                $("#pag-pre-"+visible).val(siguiente);
            }
	   
	    }, 
	    wipeRight: function() 
	    { 
	      	var visible=$("#visible-pre").val();
	        var pag=parseInt($("#pag-pre-"+visible).val());
	        var total=parseInt($("#total-pre-"+visible).val());
	        var siguiente=1;
            siguiente=pag-siguiente;
            if (siguiente >=1) {
                $(".pre-paginas-"+visible).hide();
                $(".pag-"+visible+"-"+siguiente).show();
                $("#pag-pre-"+visible).val(siguiente);
                
            }
	    },
	    min_move_x: 0,
	    min_move_y: 0,
	    preventDefaultEvents: true
	});

	$(".veo-pre").click(function(){
		var ide=$(this).attr("id");


		$(".todas-pres").hide();
		$(".presentaciones").addClass('oculto');
		$(".presentacion").removeClass('oculto');
		$(".todas-pres").hide();
		$(".contiene-pre-"+ide).show();
		$(".pre-paginas-"+ide).hide();
		
		var encual = $("#pag-pre-" + ide).val();
		
		$(".pag-"+encual).show();
		$(".barra-menu").show();
		$(".ir-home").hide();
		$("#visible-pre").val(ide);
		
	});

	var socket = io.connect();
	
	$(".cierro-voto").click(function(){
		$(".contiene-pregunta").hide();
		$(".fondo-negro").hide();
	});
	
	$(".cierro-live").click(function(){
		$(".experto").hide();
		$(".fondo-negro").hide();
	});
	
	$(".show-live").click(function(){
		$(".experto").show();
		$(".fondo-negro").show();
	});

	$('.msg-close').click(function() {
		$('.msg-alert').addClass('oculto');
	});

	$(".btn-envio-pregunta").click(function(){
		if($('#pregunta-ponente').val() != "") {
			envio_pregunta();	
		}else {
			$('.msg-txt').text("lo sentimos, el campo de pregunta no puede ir vacio!");
			$('.msg-alert').removeClass('oculto');
		}
		
	});

	socket.on("hay alerta",function(data){
		if (data.op) {
			$('.msg-txt').text(data.msg);
			$('.msg-alert').removeClass("oculto");
			setTimeout(function(){
				$('.msg-txt').text("");
				$('.msg-alert').addClass("oculto");
			},8000);
		}else{
			$('.msg-txt').text("");
			$('.msg-alert').addClass("oculto");
		}
	});

	socket.on("hay voteo", function(data){		
		if (data.opp=="1") {
			if (data.op) {
				$(".txt-alerta").html(data.msg);
				$("#notificacion").show();
				setTimeout(function(){
					$("#notificacion").hide();
					$(".txt-alerta").html('');
				},8000);
			}else{
				$("#notificacion").hide();
				$(".txt-alerta").html('');
			}
		}else if (data.opp=="2") {
			$(".gracias").hide();
			if (data.op) {

				var pregunta="";
				var idepregunta="";
				var yavotos=data.yavoto;
				$(".respuestas").html('');
				$(".contiene-pregunta").show();
				for (var i = 0; i < data.infos.length; i++) {
					pregunta=data.infos[0].nombre;
					idepregunta=data.infos[0].idvoto_pregunta;
					$(".respuestas").append('<div class="row preguntas-voteo-muestro">'
					+'<div class="col-lg-12 col-md-12 col-sm-12">'
					+'<input type="radio" name="radiog_lite" id="radio'+data.infos[i].idvoto_respuesta+'" class="css-checkbox" value="u-'+data.infos[i].idvoto_respuesta+'"><label for="radio'+data.infos[i].idvoto_respuesta+'" class="css-label">'+data.infos[i].opcion+'</label>'
					+'</div>'
					+'</div>'
					+'<hr />');
				};
			    
			    $(".pregunta").html(pregunta);
				
				$("#notificacion").hide();
			    if (!yavotos) {
			    	clearTimeout(settime);
			    	$("#reloj_cuenta").val(50);
			    	cuenta_regresiva();
					$(".css-checkbox").off();
					$(".css-checkbox").click(function(){
						var ide=$(this).val();
						$(".barrita").show();
						var user=$("#usuario").val();
						socket.emit("voto",{ide:ide,user:user,pregunta:idepregunta},function(data){
							
						});
						$(".cierro-voto").show();
						pongo_off();
					});
			    }else{
			    	$(".contiene-pregunta").show();
					pongo_off();
			    	socket.emit("voto2",idepregunta,function(data){});
			    	$(".cierro-voto").show();
			    }
			}else{
				$(".fondo-negro").hide();
				$(".contiene-pregunta").hide();
			}
		}
	});
	
	function pongo_off(){
		$(".css-checkbox").off();
		$(".css-checkbox").prop("disabled",true);
		$(".gracias").show();
	}
	
	socket.on("calculando",function(data){
		
		var algo=Object.keys(data);

		var total=0;
		for (var i = 0,p=1; i < algo.length; i++,p++) {
			total+=data[algo[i]];
		}

		for (var i = 0,p=1; i < algo.length; i++,p++) {
			var num=(parseInt(data[algo[i]])*100)/total;
			// console.log(total);
			// console.log(num)
			var otro=algo[i].split("-");
			//$("#progressbar"+i).css({"width":num+"%"},1000);
			$("#progressbar"+otro[1]).animate({ width: num+"%" }, 1000 );
			$(".porcentaje"+otro[1]).html(Math.round(num)+"%");
		}
	});


	$(".cerrar-alerta").click(function(){
		$(".alerta-login").hide();
	});
	
	
	function envio_pregunta(){
		$('.msg-1').html('Su pregunta se esta enviando<br /> Espere por favor...');
		$(".mandando-pregunta").removeClass('oculto');
		
		var pregunta = $("#pregunta-ponente").val();
		
		setTimeout(function(){
			socket.emit("pregunta live",{pregunta:pregunta},function(data){
				if (data) {
					$("#pregunta-ponente").val("");
					$(".txt-enviando").addClass('oculto');
					$('.msg-2').text("Su pregunta se envio con exito.");
					$(".txt-confirmado").removeClass('oculto');

					setTimeout(function(){
						$(".mandando-pregunta").addClass('oculto');
						$(".txt-enviando").removeClass('oculto');
						$(".txt-confirmado").addClass('oculto');
						$('.experto').addClass('oculto');
						$('.pag-inicio').removeClass('oculto');
						$(".menu").addClass('oculto');
						$('#current').val('pag-inicio');
					},1500);
				};
			});
		}, 1500);
	}	
	
	function envio_encuesta(data){
		$('.msg-1').html('Su encuesta se esta enviando<br /> Espere por favor...');
		$(".mandando-pregunta").removeClass('oculto');		
		
		setTimeout(function(){
			socket.emit("save survey",{data:data},function(callback){
				if (callback) {
					$(".txt-enviando").addClass('oculto');
					$('.msg-2').text("Su encuesta se envio con exito.");
					$(".txt-confirmado").removeClass('oculto');

					setTimeout(function(){
						$(".mandando-pregunta").addClass('oculto');
						$(".txt-enviando").removeClass('oculto');
						$(".txt-confirmado").addClass('oculto');
						$('.encuestas_satisfaccion').addClass('oculto');
						$('.pag-inicio').removeClass('oculto');
						limpiar_checks();

						$('#current').val('pag-inicio');
					},2000);
				};
			});
		}, 2000);
	}	

	var settime="";
	function cuenta_regresiva(){
		var num=$("#reloj_cuenta").val();
		if (num<=0) {
			$(".cierro-voto").show();
			$("#reloj_cuenta").val(50);
			pongo_off();
		}else{
			num--;
			$("#reloj_cuenta").val(num);
			$(".reloj").html(num);
			settime=setTimeout(function(){
				cuenta_regresiva();
			},1000);
		}
	}

	socket.on('reloadAllApp',function (data) {
		console.log("tengo que reload");
		location.reload();
	});
});